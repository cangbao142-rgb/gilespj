import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ljyktooeikwjdhwcxazm.supabase.co",
      },
    ],
  },
  // 旧版管理后台（public/admin/*.html）保留无扩展名访问
  async rewrites() {
    return [
      { source: "/admin/login", destination: "/admin/login.html" },
      { source: "/admin/dashboard", destination: "/admin/dashboard.html" },
      { source: "/admin/post", destination: "/admin/post.html" },
    ];
  },
};

export default nextConfig;
