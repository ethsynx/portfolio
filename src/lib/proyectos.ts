/**
 * Tipos y constantes de los proyectos, compartidos entre la web pública,
 * el panel /admin y el servidor. No contiene código de servidor.
 */

export const CATEGORIAS = ["plugins", "bots", "networks"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  plugins: "Plugins",
  bots: "Bots de Discord",
  networks: "Networks y splitters",
};

/** Etiqueta corta para la esquina de la portada. */
export const ETIQUETA_CATEGORIA: Record<Categoria, string> = {
  plugins: "Plugin",
  bots: "Bot de Discord",
  networks: "Network",
};

export const FILTROS = [
  { valor: "todos", nombre: "Todos" },
  { valor: "plugins", nombre: "Plugins" },
  { valor: "bots", nombre: "Bots de Discord" },
  { valor: "networks", nombre: "Networks y splitters" },
] as const;
export type Filtro = (typeof FILTROS)[number]["valor"];

export const ESTADOS_DESARROLLO = ["en-desarrollo", "terminado"] as const;
export type EstadoDesarrollo = (typeof ESTADOS_DESARROLLO)[number];

export const NOMBRE_ESTADO: Record<EstadoDesarrollo, string> = {
  "en-desarrollo": "En desarrollo",
  terminado: "Terminado",
};

export interface Archivo {
  id: string;
  /** Ruta desde la que se sirve, p. ej. /archivos/<id> */
  url: string;
  nombre: string;
  tamano: number;
  tipo: string;
  alt: string;
}

export interface Proyecto {
  id: string;
  titulo: string;
  categoria: Categoria;
  /** Frase corta para la tarjeta. */
  resumen: string;
  /** Qué problema quería resolver. */
  problema: string;
  /** Qué hice yo. */
  aportacion: string;
  /** Cómo se puede probar. */
  comoProbar: string;
  tecnologias: string[];
  fecha: string;
  estadoDesarrollo: EstadoDesarrollo;
  publicado: boolean;
  portada: Archivo | null;
  capturas: Archivo[];
  descarga: Archivo | null;
  enlaces: { repositorio: string; demo: string; descargaExterna: string };
  creadoEn: string;
  actualizadoEn: string;
  publicadoEn: string | null;
}

/** Límites de subida (se comprueban también en el servidor). */
export const LIMITES = {
  imagenBytes: 8 * 1024 * 1024,
  descargaBytes: 50 * 1024 * 1024,
  capturas: 10,
  tecnologias: 12,
} as const;

export const EXTENSIONES_DESCARGA = [
  ".jar",
  ".zip",
  ".7z",
  ".rar",
  ".tar.gz",
  ".tgz",
  ".mcpack",
  ".mrpack",
];

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
