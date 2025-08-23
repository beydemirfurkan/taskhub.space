import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // İsteğe bağlı: daha fazla debug bilgisi
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    // Build sırasında ESLint hatalarını yoksay (sadece geliştirme için)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
