import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import obfuscator from "vite-plugin-obfuscator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" &&
      obfuscator({
        globalOptions: {
          compact: true, // Kompres kode
          controlFlowFlattening: true, // Mengaburkan alur kontrol
          stringArray: true, // Mengaburkan string
          rotateStringArray: true, // Rotasi array string
          unicodeEscapeSequence: true, // Gunakan escape sequence Unicode
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Nonaktifkan source map untuk produksi
    minify: "terser", // Gunakan Terser untuk minifikasi tambahan
    terserOptions: {
      compress: true,
      mangle: true, // Mengaburkan nama variabel
    },
  },
}));
