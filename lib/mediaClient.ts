// Browser-only media helpers for the admin uploader.

const POSTER_MAX_WIDTH = 1280;

/**
 * Grabs a still frame (about half a second in, past any fade from black) from
 * a video file or URL and returns it as a JPEG. URLs must allow CORS, which
 * Supabase public storage does.
 */
export function captureVideoFrame(source: File | string, atSeconds = 0.5): Promise<Blob> {
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
      video.currentTime = Math.min(atSeconds, Math.max(0, video.duration - 0.1));
    });
    video.addEventListener("seeked", () => {
      const scale = Math.min(1, POSTER_MAX_WIDTH / video.videoWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) resolve(blob);
          else reject(new Error("Couldn't create the preview image."));
        },
        "image/jpeg",
        0.82
      );
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
