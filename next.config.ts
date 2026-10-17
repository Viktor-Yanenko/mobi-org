import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? 'http://localhost:5000';

const nextConfig: NextConfig = {
  images: {
    // next/image показує фото лише з цих адрес
    remotePatterns: [new URL('https://res.cloudinary.com/**')],
  },
  experimental: {
    // запити через /api Next.js обрізає на 10 МБ, а фото до бекенду
    // можна відправити до 5 штук по 5 МБ
    proxyClientMaxBodySize: '30mb',
  },
    // браузер ходить на /api/... нашого ж сайту, а Next.js пересилає запит на бекенд.
    // Так cookie сесії належать домену фронтенду і браузер їх не блокує
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
