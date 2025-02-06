/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v3.fal.media",
        port: "", // leave empty if no specific port is required
        pathname: "/**", // allow all paths
      },
    ],
  },
};

export default nextConfig;
