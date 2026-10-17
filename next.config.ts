import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? 'http://localhost:5000';

const nextConfig: NextConfig = {
  images: {
    // next/image показує фото лише з цих адрес
    remotePatterns: [new URL('https://res.cloudinary.com/**')],
  },
    // браузер ходить на /api/... нашого ж сайту, а Next.js пересилає запит на бекенд.
    // Так cookie сесії належать домену фронтенду і браузер їх не блокує
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
