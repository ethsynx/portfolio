import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { EXTENSIONES_DESCARGA, LIMITES, formatearTamano } from "@/lib/proyectos";

import { dirArchivos } from "./db.server";

export type TipoArchivo = "portada" | "captura" | "descarga";

/** Error con un mensaje que se puede enseñar tal cual en el panel. */
export class ErrorValidacion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorValidacion";
  }
}

export interface ArchivoPreparado {
  id: string;
  tipo: TipoArchivo;
  nombre: string;
  mime: string;
  tamano: number;
  alt: string;
  datos: Buffer;
}

const ID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function esIdValido(id: string): boolean {
  return ID_VALIDO.test(id);
}

function empiezaPor(datos: Buffer, bytes: number[], desde = 0): boolean {
  return bytes.every((byte, i) => datos[desde + i] === byte);
}

/** Detecta el tipo de imagen por su contenido real, no por la extensión. */
function tipoDeImagen(datos: Buffer): string | null {
  if (empiezaPor(datos, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (empiezaPor(datos, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (empiezaPor(datos, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (
    empiezaPor(datos, [0x52, 0x49, 0x46, 0x46]) &&
    empiezaPor(datos, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }
  return null;
}

const FIRMAS_DESCARGA: { extensiones: string[]; mime: string; firmas: number[][] }[] = [
  {
    extensiones: [".jar", ".zip", ".mcpack", ".mrpack"],
    mime: "application/zip",
    firmas: [
      [0x50, 0x4b, 0x03, 0x04],
      [0x50, 0x4b, 0x05, 0x06],
    ],
  },
  {
    extensiones: [".7z"],
    mime: "application/x-7z-compressed",
    firmas: [[0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]],
  },
  {
    extensiones: [".rar"],
    mime: "application/vnd.rar",
    firmas: [[0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]],
  },
  { extensiones: [".tar.gz", ".tgz"], mime: "application/gzip", firmas: [[0x1f, 0x8b]] },
];

/** Nombre seguro para mostrar y para la descarga (sin rutas ni caracteres de control). */
export function limpiarNombre(nombre: string): string {
  const base = nombre.split(/[\\/]/).pop() ?? "archivo";
  const limpio = base
    .replace(/[\p{Cc}"<>|:*?]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return (limpio || "archivo").slice(0, 120);
}

async function leer(archivo: File, limite: number, etiqueta: string): Promise<Buffer> {
  if (archivo.size === 0) throw new ErrorValidacion(`${etiqueta}: el archivo está vacío.`);
  if (archivo.size > limite) {
    throw new ErrorValidacion(`${etiqueta}: supera el límite de ${formatearTamano(limite)}.`);
  }
  const datos = Buffer.from(await archivo.arrayBuffer());
  if (datos.length > limite)
    throw new ErrorValidacion(`${etiqueta}: supera el límite de ${formatearTamano(limite)}.`);
  return datos;
}

export async function prepararImagen(
  archivo: File,
  tipo: "portada" | "captura",
  alt: string,
): Promise<ArchivoPreparado> {
  const etiqueta = tipo === "portada" ? "Portada" : `Captura «${limpiarNombre(archivo.name)}»`;
  const datos = await leer(archivo, LIMITES.imagenBytes, etiqueta);
  const mime = tipoDeImagen(datos);
  if (!mime)
    throw new ErrorValidacion(`${etiqueta}: solo se admiten imágenes PNG, JPG, WebP o GIF.`);
  return {
    id: crypto.randomUUID(),
    tipo,
    nombre: limpiarNombre(archivo.name),
    mime,
    tamano: datos.length,
    alt: alt.slice(0, 200),
    datos,
  };
}

export async function prepararDescarga(archivo: File): Promise<ArchivoPreparado> {
  const nombre = limpiarNombre(archivo.name);
  const minusculas = nombre.toLowerCase();
  const formato = FIRMAS_DESCARGA.find((f) =>
    f.extensiones.some((ext) => minusculas.endsWith(ext)),
  );
  if (!formato) {
    throw new ErrorValidacion(
      `Descarga: formato no admitido. Usa ${EXTENSIONES_DESCARGA.join(", ")}.`,
    );
  }
  const datos = await leer(archivo, LIMITES.descargaBytes, "Descarga");
  if (!formato.firmas.some((firma) => empiezaPor(datos, firma))) {
    throw new ErrorValidacion("Descarga: el contenido no corresponde a su extensión.");
  }
  return {
    id: crypto.randomUUID(),
    tipo: "descarga",
    nombre,
    mime: formato.mime,
    tamano: datos.length,
    alt: "",
    datos,
  };
}

export function rutaEnDisco(id: string): string {
  if (!esIdValido(id)) throw new Error("Identificador de archivo no válido.");
  return path.join(dirArchivos(), id);
}

export function escribirEnDisco(archivos: ArchivoPreparado[]) {
  const escritos: string[] = [];
  try {
    for (const archivo of archivos) {
      fs.writeFileSync(rutaEnDisco(archivo.id), archivo.datos, { flag: "wx" });
      escritos.push(archivo.id);
    }
  } catch (error) {
    borrarDelDisco(escritos);
    throw error;
  }
}

export function borrarDelDisco(ids: string[]) {
  for (const id of ids) {
    try {
      fs.rmSync(rutaEnDisco(id), { force: true });
    } catch (error) {
      console.error(`No se ha podido borrar el archivo ${id}:`, error);
    }
  }
}
