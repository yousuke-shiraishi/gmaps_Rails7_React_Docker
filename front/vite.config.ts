import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Docker なら api:3000、ローカルRailsなら .env で上書き
  const API_TARGET = env.VITE_API_TARGET || "http://api:3000";

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: ["front", "nginx", "localhost"],
      strictPort: true,
      watch: { usePolling: true, interval: 100 },
      proxy: {
        "/api": { target: API_TARGET, changeOrigin: true },
        "/rails/active_storage": { target: API_TARGET, changeOrigin: true },
        // ★ Devise のエンドポイント（/users/...）を Rails へ中継
        "/users": { target: API_TARGET, changeOrigin: true },
      },
    },
    preview: { host: true, port: 5173 },
  };
});
