import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/contact", destination: "/", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/support", destination: "/", permanent: false },
      { source: "/impressum", destination: "/privacy", permanent: false },
      { source: "/imprint", destination: "/privacy", permanent: false },
      { source: "/legal", destination: "/terms", permanent: false },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
