import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local dev database (`prisma dev`) only tolerates a couple of concurrent connections;
  // capping build parallelism avoids connection-reset errors during static generation.
  experimental: {
    cpus: 1,
  },
  images: {
    remotePatterns: [
      // Seed-data placeholder images only. Real product photos are served from Cloudinary.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
