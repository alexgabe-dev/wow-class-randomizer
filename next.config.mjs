import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import { fileURLToPath } from "node:url";

/** @param {string} phase @returns {import('next').NextConfig} */
const nextConfig = (phase) => ({
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  // Keep local previews intact while running a production build.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
});

export default nextConfig;
