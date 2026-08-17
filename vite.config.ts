import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const target = env.VITE_DEV_PROXY_TARGET;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": { target, changeOrigin: true },
        "/wallet": { target, changeOrigin: true },
      },
    },
  };
});