import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envDir: "App/helloworld/src/app/buyer",
  server: {
    host: "0.0.0.0",
  },
});
