import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()], // react() = JSX + fast refresh; tailwindcss() = compiles Tailwind
  server: { port: 5173 },
});