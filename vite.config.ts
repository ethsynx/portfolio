// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// La web se publica como archivos estáticos en GitHub Pages, dentro de una
// subcarpeta con el nombre del repositorio (usuario.github.io/portfolio/).
// El workflow de GitHub pone BASE_PATH; en tu ordenador se usa "/".
const base = process.env["BASE_PATH"] || "/";

export default defineConfig({
  vite: { base },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Genera el HTML de la página al compilar: no hace falta servidor para verla.
    prerender: { enabled: true, crawlLinks: false, failOnError: true },
    pages: [{ path: "/" }],
  },
});
