import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      target: "esnext",
    },
  },
});

