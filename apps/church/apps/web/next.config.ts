import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? "standalone" : undefined,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: [
    "@kairos/ui", "@kairos/utils", "@kairos/types",
    "@kairos/services-ai", "@kairos/chat",
    "@kairos/cells", "@kairos/finance", "@kairos/members",
    "@kairos/ministries",     "@kairos/events", "@kairos/prayer", "@kairos/sermons", "@kairos/congregations",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
