import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This project's git root sits one level up (alongside unrelated
  // folders), which can make Turbopack guess the wrong workspace root —
  // pin it explicitly to this directory.
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Ad uploads (video up to MAX_UPLOAD_BYTES.video = 40MB) go through a
      // Server Action as multipart FormData — the 1MB default body limit
      // rejects those before our own file-size validation ever runs.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
