import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "arcadelearn.onrender.com",
      ".onrender.com", // Allow all Render subdomains
      "localhost",
      "127.0.0.1"
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["three", "three-globe", "@react-three/fiber", "@react-three/drei"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("reactflow") ||
            id.includes("@reactflow")
          ) {
            return "flow";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("pdfjs-dist")) {
            return "pdf";
          }

          if (
            id.includes("@monaco-editor") ||
            id.includes("monaco-editor")
          ) {
            return "editor";
          }

          if (
            id.includes("three-globe") ||
            id.includes("@react-three/") ||
            id.includes("/three/")
          ) {
            return "globe";
          }

          if (id.includes("@radix-ui/")) {
            return "radix";
          }

          if (id.includes("@supabase/")) {
            return "supabase";
          }

          if (
            id.includes("/react/") ||
            id.includes("react-dom") ||
            id.includes("scheduler")
          ) {
            return "vendor";
          }

          const packagePath = id.split("node_modules/")[1];
          if (!packagePath) {
            return "misc-vendor";
          }

          const segments = packagePath.split("/");
          const packageName = segments[0]?.startsWith("@")
            ? `${segments[0]}/${segments[1]}`
            : segments[0];

          if (!packageName) {
            return "misc-vendor";
          }

          return `npm-${packageName.replace("@", "").replace("/", "-")}`;
        },
      },
    },
  },
});
