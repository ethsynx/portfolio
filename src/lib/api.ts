/**
 * Funciones de servidor (RPC). El cuerpo de cada handler solo se ejecuta en el
 * servidor; el navegador recibe un stub que hace la petición. Los módulos
 * *.server.ts se importan dentro de los handlers para que nunca lleguen al cliente.
 */
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { CATEGORIAS, ESTADOS_DESARROLLO, LIMITES, type Proyecto } from "@/lib/proyectos";

export type Resultado<T> =
  { ok: true; datos: T } | { ok: false; error: string; sinSesion?: boolean };

function sinCache() {
  setResponseHeader("Cache-Control", "no-store");
}

/** Convierte errores en mensajes para el panel sin filtrar detalles internos. */
async function protegido<T>(fn: () => Promise<T> | T): Promise<Resultado<T>> {
  sinCache();
  try {
    return { ok: true, datos: await fn() };
  } catch (error) {
    if (error instanceof Error && error.name === "NoAutorizado") {
      return { ok: false, error: error.message, sinSesion: true };
    }
    if (error instanceof Error && (error.name === "ErrorValidacion" || error.name === "ZodError")) {
      const mensaje =
        error.name === "ZodError"
          ? ((error as z.ZodError).issues[0]?.message ?? "Datos no válidos.")
          : error.message;
      return { ok: false, error: mensaje };
    }
    console.error(error);
    return { ok: false, error: "Algo ha fallado en el servidor. Inténtalo de nuevo." };
  }
}

/* ------------------------------------------------------------------ público */

export const obtenerProyectosPublicados = createServerFn({ method: "GET" }).handler(async () => {
  const { listarProyectos } = await import("@/server/proyectos.server");
  return listarProyectos({ soloPublicados: true });
});

/* ------------------------------------------------------------------- acceso */

export const obtenerEstadoAdmin = createServerFn({ method: "GET" }).handler(async () => {
  sinCache();
  const { accesoConfigurado, sesionActiva } = await import("@/server/auth.server");
  return { configurado: accesoConfigurado(), autenticado: sesionActiva() };
});

export const iniciarSesionFn = createServerFn({ method: "POST" })
  .validator(z.object({ usuario: z.string().max(100), contrasena: z.string().max(200) }))
  .handler(async ({ data }) => {
    sinCache();
    const { iniciarSesion } = await import("@/server/auth.server");
    return iniciarSesion(data.usuario, data.contrasena);
  });

export const cerrarSesionFn = createServerFn({ method: "POST" }).handler(async () => {
  sinCache();
  const { cerrarSesion } = await import("@/server/auth.server");
  cerrarSesion();
  return { ok: true };
});

/* ------------------------------------------------------------ panel privado */

const idProyecto = z.string().uuid("Identificador no válido.");

export const listarProyectosAdmin = createServerFn({ method: "GET" }).handler(async () =>
  protegido(async () => {
    const { exigirAdmin } = await import("@/server/auth.server");
    const { listarProyectos } = await import("@/server/proyectos.server");
    exigirAdmin();
    return listarProyectos({ soloPublicados: false });
  }),
);

export const obtenerProyectoAdmin = createServerFn({ method: "GET" })
  .validator(z.object({ id: idProyecto }))
  .handler(async ({ data }) =>
    protegido(async () => {
      const { exigirAdmin } = await import("@/server/auth.server");
      const { obtenerProyecto } = await import("@/server/proyectos.server");
      exigirAdmin();
      return obtenerProyecto(data.id);
    }),
  );

const enlace = z
  .string()
  .trim()
  .max(500, "El enlace es demasiado largo.")
  .refine((valor) => {
    if (valor === "") return true;
    try {
      const url = new URL(valor);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Los enlaces deben empezar por https://");

const esquemaProyecto = z.object({
  id: z.union([z.literal(""), idProyecto]),
  titulo: z
    .string()
    .trim()
    .min(2, "El título necesita al menos 2 caracteres.")
    .max(80, "Título: máximo 80 caracteres."),
  categoria: z.enum(CATEGORIAS, { errorMap: () => ({ message: "Elige una categoría." }) }),
  resumen: z.string().trim().max(240, "Resumen: máximo 240 caracteres."),
  problema: z.string().trim().max(3000, "«Qué quería resolver»: máximo 3000 caracteres."),
  aportacion: z.string().trim().max(3000, "«Qué hice»: máximo 3000 caracteres."),
  comoProbar: z.string().trim().max(3000, "«Cómo probarlo»: máximo 3000 caracteres."),
  tecnologias: z
    .string()
    .max(600)
    .transform((valor) =>
      [
        ...new Set(
          valor
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ].map((t) => t.slice(0, 30)),
    )
    .refine(
      (lista) => lista.length <= LIMITES.tecnologias,
      `Como máximo ${LIMITES.tecnologias} tecnologías.`,
    ),
  fecha: z.string().trim().max(20, "Fecha: máximo 20 caracteres."),
  estadoDesarrollo: z.enum(ESTADOS_DESARROLLO, {
    errorMap: () => ({ message: "Elige el estado del desarrollo." }),
  }),
  repositorio: enlace,
  demo: enlace,
  descargaExterna: enlace,
});

function archivoDe(valor: FormDataEntryValue | null): File | null {
  return valor instanceof File && valor.size > 0 ? valor : null;
}

export const guardarProyectoFn = createServerFn({ method: "POST" })
  .validator((datos: unknown) => {
    if (!(datos instanceof FormData)) throw new Error("Se esperaba un formulario.");
    return datos;
  })
  .handler(async ({ data: formulario }) =>
    protegido(async (): Promise<Proyecto> => {
      const { exigirAdmin } = await import("@/server/auth.server");
      const { prepararImagen, prepararDescarga, ErrorValidacion, esIdValido } =
        await import("@/server/archivos.server");
      const { guardarProyecto } = await import("@/server/proyectos.server");
      exigirAdmin();

      const texto = (clave: string) => {
        const valor = formulario.get(clave);
        return typeof valor === "string" ? valor : "";
      };
      const campos = esquemaProyecto.parse({
        id: texto("id"),
        titulo: texto("titulo"),
        categoria: texto("categoria"),
        resumen: texto("resumen"),
        problema: texto("problema"),
        aportacion: texto("aportacion"),
        comoProbar: texto("comoProbar"),
        tecnologias: texto("tecnologias"),
        fecha: texto("fecha"),
        estadoDesarrollo: texto("estadoDesarrollo"),
        repositorio: texto("repositorio"),
        demo: texto("demo"),
        descargaExterna: texto("descargaExterna"),
      });

      // Archivos: todo se valida antes de escribir nada.
      const nuevaPortada = archivoDe(formulario.get("portada"));
      const nuevaDescarga = archivoDe(formulario.get("descarga"));
      const nuevasCapturas = formulario
        .getAll("capturas")
        .map(archivoDe)
        .filter((f): f is File => f !== null);
      if (nuevasCapturas.length > LIMITES.capturas) {
        throw new ErrorValidacion(`Como máximo ${LIMITES.capturas} capturas por proyecto.`);
      }

      const altCapturas: Record<string, string> = {};
      for (const [clave, valor] of formulario.entries()) {
        if (clave.startsWith("alt:") && typeof valor === "string" && esIdValido(clave.slice(4))) {
          altCapturas[clave.slice(4)] = valor.trim();
        }
      }

      const portada = nuevaPortada
        ? await prepararImagen(nuevaPortada, "portada", `Portada de ${campos.titulo}`)
        : texto("quitarPortada") === "1"
          ? null
          : undefined;
      const descarga = nuevaDescarga
        ? await prepararDescarga(nuevaDescarga)
        : texto("quitarDescarga") === "1"
          ? null
          : undefined;
      const capturas = [];
      for (const [indice, archivo] of nuevasCapturas.entries()) {
        capturas.push(
          await prepararImagen(archivo, "captura", `Captura ${indice + 1} de ${campos.titulo}`),
        );
      }

      const { id, ...datos } = campos;
      return guardarProyecto(id || null, datos, {
        portada,
        descarga,
        nuevasCapturas: capturas,
        quitarCapturas: formulario
          .getAll("quitarCaptura")
          .filter((v): v is string => typeof v === "string"),
        altCapturas,
      });
    }),
  );

export const cambiarPublicacionFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: idProyecto, publicar: z.boolean() }))
  .handler(async ({ data }) =>
    protegido(async () => {
      const { exigirAdmin } = await import("@/server/auth.server");
      const { cambiarPublicacion } = await import("@/server/proyectos.server");
      exigirAdmin();
      return cambiarPublicacion(data.id, data.publicar);
    }),
  );

export const eliminarProyectoFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: idProyecto }))
  .handler(async ({ data }) =>
    protegido(async () => {
      const { exigirAdmin } = await import("@/server/auth.server");
      const { eliminarProyecto } = await import("@/server/proyectos.server");
      exigirAdmin();
      eliminarProyecto(data.id);
      return true;
    }),
  );
