import { fileURLToPath, URL } from "url";
import { defineConfig, loadEnv  } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: "8080",
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: fileURLToPath(new URL("./src", import.meta.url)),
        },
        {
          find: "lib",
          replacement: resolve(__dirname, "lib"),
        },
      ],
    },
    define: {
      'process.env.REACT_APP_GEMINI_API_KEY': JSON.stringify(env.REACT_APP_GEMINI_API_KEY),
      'process.env.REACT_APP_GOOGLE_CLIENT_ID': JSON.stringify(env.REACT_APP_GOOGLE_CLIENT_ID),
      'process.env.REACT_APP_GOOGLE_API_KEY': JSON.stringify(env.REACT_APP_GOOGLE_API_KEY),
      'process.env.REACT_APP_GOOGLE_CALENDAR_ID': JSON.stringify(env.REACT_APP_GOOGLE_CALENDAR_ID),
    },
  };
});