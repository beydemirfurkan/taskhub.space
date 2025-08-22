import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // İsteğe bağlı: daha fazla debug bilgisi
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
