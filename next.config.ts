import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Necesario para probar por túnel (ngrok/cloudflared) desde otra red:
  // Next 16 bloquea por defecto las requests cross-origin al dev server.
  allowedDevOrigins: ["*.ngrok-free.app", "*.trycloudflare.com"],
};

export default nextConfig;
