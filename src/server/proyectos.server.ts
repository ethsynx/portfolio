import crypto from "node:crypto";

import type { Archivo, Categoria, EstadoDesarrollo, Proyecto } from "@/lib/proyectos";
import { LIMITES } from "@/lib/proyectos";

import {
  type ArchivoPreparado,
  ErrorValidacion,
  borrarDelDisco,
  escribirEnDisco,
} from "./archivos.server";
import { baseDeDatos, transaccion } from "./db.server";

interface FilaProyecto {
  id: string;
  titulo: string;
  categoria: Categoria;
  resumen: string;
  problema: string;
  aportacion: string;
  como_probar: string;
  tecnologias: string;
  fecha: string;
  estado_desarrollo: EstadoDesarrollo;
  publicado: number;
  repositorio: string;
  demo: string;
  descarga_externa: string;
  creado_en: string;
  actualizado_en: string;
  publicado_en: string | null;
}

interface FilaArchivo {
  id: string;
  proyecto_id: string;
  tipo: "portada" | "captura" | "descarga";
  nombre: string;
  mime: string;
  tamano: number;
  alt: string;
  posicion: number;
}

export interface DatosProyecto {
  titulo: string;
  categoria: Categoria;
  resumen: string;
  problema: string;
  aportacion: string;
  comoProbar: string;
  tecnologias: string[];
  fecha: string;
  estadoDesarrollo: EstadoDesarrollo;
  repositorio: string;
  demo: string;
  descargaExterna: string;
}

export interface CambiosArchivos {
  /** undefined = no tocar; null = quitar; objeto = sustituir. */
  portada?: ArchivoPreparado | null | undefined;
  descarga?: ArchivoPreparado | null | undefined;
  nuevasCapturas: ArchivoPreparado[];
  quitarCapturas: string[];
  altCapturas: Record<string, string>;
}

function aArchivo(fila: FilaArchivo): Archivo {
  return {
    id: fila.id,
    url: `/archivos/${fila.id}`,
    nombre: fila.nombre,
    tamano: fila.tamano,
    tipo: fila.mime,
    alt: fila.alt,
  };
}

function aProyecto(fila: FilaProyecto, archivos: FilaArchivo[]): Proyecto {
  const propios = archivos.filter((a) => a.proyecto_id === fila.id);
  const portada = propios.find((a) => a.tipo === "portada");
  const descarga = propios.find((a) => a.tipo === "descarga");
  let tecnologias: string[] = [];
  try {
    tecnologias = JSON.parse(fila.tecnologias) as string[];
  } catch {
    tecnologias = [];
  }
  return {
    id: fila.id,
    titulo: fila.titulo,
    categoria: fila.categoria,
    resumen: fila.resumen,
    problema: fila.problema,
    aportacion: fila.aportacion,
    comoProbar: fila.como_probar,
    tecnologias,
    fecha: fila.fecha,
    estadoDesarrollo: fila.estado_desarrollo,
    publicado: fila.publicado === 1,
    portada: portada ? aArchivo(portada) : null,
    capturas: propios
      .filter((a) => a.tipo === "captura")
      .sort((a, b) => a.posicion - b.posicion)
      .map(aArchivo),
    descarga: descarga ? aArchivo(descarga) : null,
    enlaces: {
      repositorio: fila.repositorio,
      demo: fila.demo,
      descargaExterna: fila.descarga_externa,
    },
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en,
    publicadoEn: fila.publicado_en,
  };
}

export function listarProyectos({ soloPublicados }: { soloPublicados: boolean }): Proyecto[] {
  const db = baseDeDatos();
  const filas = db
    .prepare(
      `SELECT * FROM proyectos ${soloPublicados ? "WHERE publicado = 1" : ""}
       ORDER BY COALESCE(publicado_en, creado_en) DESC`,
    )
    .all() as unknown as FilaProyecto[];
  if (filas.length === 0) return [];
  const archivos = db
    .prepare(
      soloPublicados
        ? "SELECT a.* FROM archivos a JOIN proyectos p ON p.id = a.proyecto_id WHERE p.publicado = 1"
        : "SELECT * FROM archivos",
    )
    .all() as unknown as FilaArchivo[];
  return filas.map((fila) => aProyecto(fila, archivos));
}

export function obtenerProyecto(id: string): Proyecto | null {
  const db = baseDeDatos();
  const fila = db.prepare("SELECT * FROM proyectos WHERE id = ?").get(id) as unknown as
    FilaProyecto | undefined;
  if (!fila) return null;
  const archivos = db
    .prepare("SELECT * FROM archivos WHERE proyecto_id = ?")
    .all(id) as unknown as FilaArchivo[];
  return aProyecto(fila, archivos);
}

/** Crea (id = null) o actualiza un proyecto junto con sus archivos. */
export function guardarProyecto(
  id: string | null,
  datos: DatosProyecto,
  cambios: CambiosArchivos,
): Proyecto {
  const db = baseDeDatos();
  const ahora = new Date().toISOString();
  const proyectoId = id ?? crypto.randomUUID();

  if (id) {
    const existe = db.prepare("SELECT 1 AS ok FROM proyectos WHERE id = ?").get(id);
    if (!existe) throw new ErrorValidacion("Ese proyecto ya no existe.");
  }

  const actuales = id
    ? (db
        .prepare("SELECT * FROM archivos WHERE proyecto_id = ?")
        .all(id) as unknown as FilaArchivo[])
    : [];
  const capturasActuales = actuales.filter((a) => a.tipo === "captura");
  const quitar = new Set(
    cambios.quitarCapturas.filter((cid) => capturasActuales.some((c) => c.id === cid)),
  );
  const quedan = capturasActuales.filter((c) => !quitar.has(c.id));
  if (quedan.length + cambios.nuevasCapturas.length > LIMITES.capturas) {
    throw new ErrorValidacion(`Como máximo ${LIMITES.capturas} capturas por proyecto.`);
  }

  // Archivos que dejarán de usarse (se borran del disco solo si todo sale bien).
  const aBorrar: string[] = [...quitar];
  if (cambios.portada !== undefined)
    aBorrar.push(...actuales.filter((a) => a.tipo === "portada").map((a) => a.id));
  if (cambios.descarga !== undefined)
    aBorrar.push(...actuales.filter((a) => a.tipo === "descarga").map((a) => a.id));

  const nuevos = [
    ...(cambios.portada ? [cambios.portada] : []),
    ...(cambios.descarga ? [cambios.descarga] : []),
    ...cambios.nuevasCapturas,
  ];
  escribirEnDisco(nuevos);

  try {
    transaccion(() => {
      const valores = [
        datos.titulo,
        datos.categoria,
        datos.resumen,
        datos.problema,
        datos.aportacion,
        datos.comoProbar,
        JSON.stringify(datos.tecnologias),
        datos.fecha,
        datos.estadoDesarrollo,
        datos.repositorio,
        datos.demo,
        datos.descargaExterna,
      ];
      if (id) {
        db.prepare(
          `UPDATE proyectos SET titulo = ?, categoria = ?, resumen = ?, problema = ?, aportacion = ?,
             como_probar = ?, tecnologias = ?, fecha = ?, estado_desarrollo = ?, repositorio = ?, demo = ?,
             descarga_externa = ?, actualizado_en = ? WHERE id = ?`,
        ).run(...valores, ahora, id);
      } else {
        db.prepare(
          `INSERT INTO proyectos (titulo, categoria, resumen, problema, aportacion, como_probar, tecnologias,
             fecha, estado_desarrollo, repositorio, demo, descarga_externa, id, publicado, creado_en, actualizado_en)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        ).run(...valores, proyectoId, ahora, ahora);
      }

      const borrar = db.prepare("DELETE FROM archivos WHERE id = ? AND proyecto_id = ?");
      for (const archivoId of aBorrar) borrar.run(archivoId, proyectoId);

      const cambiarAlt = db.prepare(
        "UPDATE archivos SET alt = ?, posicion = ? WHERE id = ? AND proyecto_id = ?",
      );
      quedan.forEach((captura, posicion) => {
        cambiarAlt.run(
          (cambios.altCapturas[captura.id] ?? captura.alt).slice(0, 200),
          posicion,
          captura.id,
          proyectoId,
        );
      });

      const insertar = db.prepare(
        `INSERT INTO archivos (id, proyecto_id, tipo, nombre, mime, tamano, alt, posicion, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      let posicion = quedan.length;
      for (const archivo of nuevos) {
        insertar.run(
          archivo.id,
          proyectoId,
          archivo.tipo,
          archivo.nombre,
          archivo.mime,
          archivo.tamano,
          archivo.alt,
          archivo.tipo === "captura" ? posicion++ : 0,
          ahora,
        );
      }
    });
  } catch (error) {
    borrarDelDisco(nuevos.map((a) => a.id));
    throw error;
  }

  borrarDelDisco(aBorrar);
  return obtenerProyecto(proyectoId)!;
}

export function cambiarPublicacion(id: string, publicar: boolean): Proyecto {
  const proyecto = obtenerProyecto(id);
  if (!proyecto) throw new ErrorValidacion("Ese proyecto ya no existe.");
  if (publicar && !proyecto.resumen.trim()) {
    throw new ErrorValidacion(
      "Añade un resumen antes de publicar: es el texto que aparece en la tarjeta.",
    );
  }
  const ahora = new Date().toISOString();
  baseDeDatos()
    .prepare(
      `UPDATE proyectos SET publicado = ?, actualizado_en = ?,
         publicado_en = CASE WHEN ? = 1 THEN COALESCE(publicado_en, ?) ELSE publicado_en END
       WHERE id = ?`,
    )
    .run(publicar ? 1 : 0, ahora, publicar ? 1 : 0, ahora, id);
  return obtenerProyecto(id)!;
}

export function eliminarProyecto(id: string) {
  const db = baseDeDatos();
  const archivos = db
    .prepare("SELECT id FROM archivos WHERE proyecto_id = ?")
    .all(id) as unknown as { id: string }[];
  const resultado = db.prepare("DELETE FROM proyectos WHERE id = ?").run(id); // los archivos caen en cascada
  if (resultado.changes === 0) throw new ErrorValidacion("Ese proyecto ya no existe.");
  borrarDelDisco(archivos.map((a) => a.id));
}

/** Datos para servir un archivo y saber si es público. */
export function archivoParaServir(id: string): (FilaArchivo & { publicado: number }) | null {
  const fila = baseDeDatos()
    .prepare(
      `SELECT a.*, p.publicado FROM archivos a JOIN proyectos p ON p.id = a.proyecto_id WHERE a.id = ?`,
    )
    .get(id) as unknown as (FilaArchivo & { publicado: number }) | undefined;
  return fila ?? null;
}
