import { createFileRoute } from "@tanstack/react-router";

/**
 * Sirve portadas, capturas y descargas.
 * - Proyecto publicado: cualquiera puede verlo.
 * - Borrador: solo con la sesión del panel; si no, responde 404 (no revela que existe).
 */
export const Route = createFileRoute("/archivos/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const fs = await import("node:fs");
        const { Readable } = await import("node:stream");
        const { esIdValido, rutaEnDisco } = await import("@/server/archivos.server");
        const { archivoParaServir } = await import("@/server/proyectos.server");
        const { sesionActiva } = await import("@/server/auth.server");

        const noEncontrado = () =>
          new Response("No encontrado", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
          });

        if (!esIdValido(params.id)) return noEncontrado();
        const archivo = archivoParaServir(params.id);
        if (!archivo) return noEncontrado();
        const publico = archivo.publicado === 1;
        if (!publico && !sesionActiva()) return noEncontrado();

        const ruta = rutaEnDisco(archivo.id);
        if (!fs.existsSync(ruta)) return noEncontrado();

        const esDescarga = archivo.tipo === "descarga";
        const nombreAscii = archivo.nombre.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
        const disposicion = `${esDescarga ? "attachment" : "inline"}; filename="${nombreAscii}"; filename*=UTF-8''${encodeURIComponent(archivo.nombre)}`;

        const cuerpo = Readable.toWeb(fs.createReadStream(ruta)) as ReadableStream;
        return new Response(cuerpo, {
          status: 200,
          headers: {
            "Content-Type": esDescarga ? "application/octet-stream" : archivo.mime,
            "Content-Length": String(archivo.tamano),
            "Content-Disposition": disposicion,
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
            "Cache-Control": publico ? "public, max-age=300" : "private, no-store",
            ...(publico ? {} : { "X-Robots-Tag": "noindex" }),
          },
        });
      },
    },
  },
});
