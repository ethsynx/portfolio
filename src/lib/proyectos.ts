/**
 * Tipos y constantes de los proyectos. Los proyectos en sí están en
 * src/config/proyectos.ts.
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

export interface Imagen {
  /** Ruta dentro de public/, p. ej. "proyectos/miplugin/portada.png". */
  archivo: string;
  /** Descripción de la imagen para lectores de pantalla. */
  alt: string;
}

export interface Proyecto {
  titulo: string;
  categoria: Categoria;
  estado: EstadoDesarrollo;
  /** false = no aparece en la web. */
  publicado: boolean;
  fecha: string;
  /** Frase corta para la tarjeta. */
  resumen: string;
  /** Qué problema quería resolver. */
  problema: string;
  /** Qué hice yo. */
  aportacion: string;
  /** Cómo se puede probar. */
  comoProbar: string;
  tecnologias: string[];
  portada: Imagen | null;
  capturas: Imagen[];
  /** Ruta dentro de public/ del archivo descargable, o "" si no hay. */
  descarga: string;
  enlaces: { repositorio: string; demo: string; descargaExterna: string };
}

/**
 * Convierte una ruta de public/ en una URL que funciona aunque la web esté
 * en una subcarpeta (p. ej. usuario.github.io/portfolio/).
 */
export function rutaPublica(archivo: string): string {
  return import.meta.env.BASE_URL + archivo.replace(/^\/+/, "").replace(/^public\//, "");
}

/** Nombre del archivo a partir de su ruta: "a/b/Plugin.jar" → "Plugin.jar". */
export function nombreArchivo(archivo: string): string {
  return archivo.split("/").pop() ?? archivo;
}
