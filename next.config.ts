import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image показує фото лише з цих адрес
    remotePatterns: [new URL('https://res.cloudinary.com/**')],
  },
};

export default nextConfig;
