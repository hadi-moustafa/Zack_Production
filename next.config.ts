import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  agentRules: false,
  // No "X-Powered-By: Next.js" header, and no source maps shipped to browsers.
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Emit a self-contained server in .next/standalone so the Docker image
  // doesn't need the full node_modules folder.
  output: "standalone",
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
