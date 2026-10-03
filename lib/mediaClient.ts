// Browser-only media helpers for the admin uploader.

const POSTER_MAX_WIDTH = 1280;

/** The frame a video element is currently showing, as a JPEG (max 1280px wide). */
export function frameToJpeg(video: HTMLVideoElement): Promise<Blob> {
  const scale = Math.min(1, POSTER_MAX_WIDTH / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the preview image."))), "image/jpeg", 0.82)
  );
}

/**
 * Grabs a still frame from a video file or URL as a JPEG. By default it's a
 * quarter of the way in, which skips intros, title cards and fades from black.
 * URLs must allow CORS, which Supabase public storage does.
 */
export function captureVideoFrame(source: File | string, atSeconds?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = typeof source === "string" ? null : URL.createObjectURL(source);
    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.addEventListener("error", () => {
      cleanup();
      reject(new Error("Couldn't read the video to make a preview."));
    });
    video.addEventListener("loadedmetadata", () => {
      const target = atSeconds ?? Math.max(0.5, video.duration * 0.25);
      video.currentTime = Math.min(target, Math.max(0, video.duration - 0.1));
    });
    video.addEventListener("seeked", () => {
      frameToJpeg(video)
        .then(resolve, reject)
        .finally(cleanup);
    });

    video.src = typeof source === "string" ? source : objectUrl!;
  });
}

/**
 * Shrinks a large photo in the browser so it fits through the 4.5 MB request
 * limit of serverless functions. The server still validates and re-encodes it.
 */
export async function shrinkImageForUpload(file: File, maxBytes = 4 * 1024 * 1024, maxSide = 3000): Promise<File> {
  if (file.size <= maxBytes) return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

/** ~150-byte blurred stand-in for a still image, as a data URL. */
export async function blurDataUrl(image: Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(image);
    const scale = 16 / Math.max(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/webp", 0.4);
  } catch {
    return null;
  }
}

/** Pixel size of a video file, read from its metadata. */
export function videoSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(video.videoWidth ? { width: video.videoWidth, height: video.videoHeight } : null);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}

/**
 * Sends a request with upload progress (fetch can't report it). Resolves with
 * the parsed JSON body, or rejects with the server's error message.
 */
export function sendWithProgress(
  method: "POST" | "PUT",
  url: string,
  body: Blob | FormData,
  headers: Record<string, string>,
  onProgress: (fraction: number) => void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () => reject(new Error("Network error — check your connection and try again."));
    xhr.onload = () => {
      let json: { error?: string; message?: string } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON body
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else reject(new Error(json.error || json.message || `Upload failed (${xhr.status}).`));
    };
    xhr.send(body);
  });
}
