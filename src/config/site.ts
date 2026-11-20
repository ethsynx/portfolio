/**
 * =============================================================================
 *  CONFIGURACIÓN DEL SITIO
 * =============================================================================
 *  Textos fijos de la web: estudio, identidad, «Sobre mí», «Únete», contacto y SEO.
 *  Los PROYECTOS no se editan aquí: están en src/config/proyectos.ts.
 *
 *  Plantilla original diseñada y desarrollada por Electro.
 * =============================================================================
 */

export const siteConfig = {
  /** ------------------------------------------------------------------ ESTUDIO */
  /** Nombre que acompaña al logo en la cabecera, el pie y el panel. */
  studio: "NexStudios",

  /** ---------------------------------------------------------------- IDENTIDAD */
  name: "Diego",
  age: 17,
  country: "España",

  /** Titular de la portada. La segunda parte va en el rojo del template. */
  headline: { lead: "Desarrollo para", accent: "Minecraft y Discord" },
  tagline:
    "Creo plugins propios de Minecraft, desarrollo bots de Discord y configuro networks y splitters.",
  specialties: ["Plugins de Minecraft", "Bots de Discord", "Networks y splitters"],

  /** ------------------------------------------------------------------ SOBRE MÍ */
  about: {
    title: "Desarrollo lo que necesita tu servidor",
    intro:
      "Soy Diego, tengo 17 años y soy de España. Programo mis propios plugins de Minecraft, desarrollo bots de Discord y configuro networks y splitters para servidores y comunidades.",
    paragraphs: [
      "Me gusta convertir una idea en algo que funcione dentro del servidor: un comando nuevo, un bot que recibe a la gente o una network en la que cada jugador llega a su modalidad.",
      "En la sección de proyectos verás en qué estoy trabajando y lo que ya he terminado, con capturas y, cuando es posible, una forma de probarlo.",
    ],
  },

  /** --------------------------------------------------------------------- ÚNETE */
  recruiting: {
    title: "Buscamos más developers",
    description:
      "NexStudios está creciendo y queremos sumar gente que disfrute creando para Minecraft y Discord.",
    roles: [
      {
        icon: "plugin",
        title: "Desarrollo de plugins",
        description: "Programar plugins propios para servidores de Minecraft.",
        tags: ["Java", "Paper / Spigot"],
      },
      {
        icon: "bot",
        title: "Bots de Discord",
        description: "Crear bots y comandos para comunidades de Discord.",
        tags: ["JavaScript", "Python"],
      },
      {
        icon: "network",
        title: "Networks y splitters",
        description: "Configurar proxies, networks y splitters para conectar varios servidores.",
        tags: ["Velocity", "BungeeCord", "Linux"],
      },
    ],
    howTo:
      "Escríbeme por Discord y cuéntame qué sabes hacer. Si tienes algún proyecto, mándame un enlace o una captura.",
  },

  /** ------------------------------------------------------------------ CONTACTO */
  contact: {
    heading: "¿Tienes una idea para tu servidor?",
    text: "Escríbeme por Discord y cuéntame qué necesitas.",
    /** Usuario público de Discord. Solo es un dato de contacto. */
    discord: "ethsynx",
  },

  /** -------------------------------------------------------------------- PIE */
  footer: {
    description: "Plugins de Minecraft, bots de Discord y configuración de networks y splitters.",
  },

  /** --------------------------------------------------------------------- SEO */
  seo: {
    title: "NexStudios · Plugins de Minecraft, bots de Discord y networks",
    description:
      "NexStudios: plugins propios de Minecraft, bots de Discord y configuración de networks y splitters. Buscamos más developers.",
  },
} as const;

export const navLinks = [
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Únete", href: "#unete" },
  { label: "Contacto", href: "#contacto" },
];
