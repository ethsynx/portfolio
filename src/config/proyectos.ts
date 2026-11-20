/**
 * =============================================================================
 *  PROYECTOS
 * =============================================================================
 *  Aquí se añaden, cambian o quitan los proyectos de la web.
 *
 *  Para añadir uno:
 *   1. Crea una carpeta en public/proyectos/ (p. ej. public/proyectos/miplugin/)
 *      y mete dentro la portada (16:9), las capturas y el .jar o .zip.
 *   2. Copia uno de los bloques de abajo, pégalo y cambia los textos.
 *      Las rutas de los archivos se escriben sin «public/», p. ej.
 *      "proyectos/miplugin/portada.png".
 *   3. Guarda y sube los cambios con git (add, commit, push). La web se
 *      actualiza sola en un par de minutos.
 *
 *  Para ocultar un proyecto sin borrarlo, pon  publicado: false.
 *  El orden de la lista es el orden en que salen en la web.
 *
 *  Valores válidos:
 *   categoria: "plugins" | "bots" | "networks"
 *   estado:    "terminado" | "en-desarrollo"
 * =============================================================================
 */
import type { Proyecto } from "@/lib/proyectos";

export const proyectos: Proyecto[] = [
  {
    titulo: "NexCoins",
    categoria: "plugins",
    estado: "en-desarrollo",
    publicado: true,
    fecha: "2026",
    resumen:
      "NexCoins es un plugin de Minecraft que recompensa a los jugadores con una moneda por cada minuto que pasan en la zona AFK. Pueden ver cuánto falta para la siguiente recompensa y gastar sus monedas en una tienda configurable con `/coin`.",
    problema:
      "Quería que los jugadores pudieran ganar monedas mientras estaban en la zona AFK y gastarlas después en una tienda del servidor.",
    aportacion:
      "Desarrollé NexCoins, un plugin que entrega una moneda por cada minuto que el jugador pasa dentro de la zona AFK. Al entrar, recibe un aviso y ve sobre la barra de acceso rápido cuántos segundos faltan para la siguiente moneda. Añadí una tienda configurable que se abre con /coin, un historial de movimientos y un marcador de saldo para PlaceholderAPI.",
    comoProbar:
      "Coloca el .jar de NexCoins en la carpeta plugins de tu servidor Paper y reinícialo. Configura una zona AFK, entra en ella y espera un minuto para recibir tu primera moneda. Usa /coin para abrir la tienda.",
    tecnologias: ["Java", "Paper API", "PlaceholderAPI"],
    portada: { archivo: "proyectos/nexcoins/portada.png", alt: "Portada de NexCoins" },
    capturas: [],
    descarga: "proyectos/nexcoins/NexCoins-1.0.0.jar",
    enlaces: { repositorio: "", demo: "", descargaExterna: "" },
  },
  {
    titulo: "NexPunish",
    categoria: "plugins",
    estado: "terminado",
    publicado: true,
    fecha: "2026",
    resumen:
      "NexPunish es un plugin de moderación para servidores de Minecraft. Gestiona baneos permanentes y temporales, silencios, advertencias y expulsiones. Guarda el historial de sanciones e integra Discord y LuckPerms.",
    problema:
      "Quería que el staff pudiera aplicar sanciones desde Minecraft y consultar el historial de cada jugador para saber qué había pasado antes de tomar una decisión.",
    aportacion:
      "Desarrollé NexPunish, un plugin que permite aplicar baneos permanentes y temporales, silenciar, advertir y expulsar jugadores. Las sanciones se guardan en SQLite. Añadí mensajes en varios idiomas, avisos en Discord e integración con LuckPerms.",
    comoProbar:
      "Descarga el .jar para Paper 1.21.1, colócalo en la carpeta plugins de un servidor con Java 21 y reinícialo. Desde la consola, ejecuta warn JugadorDePrueba Aviso de prueba con un jugador conectado para comprobar que recibe la advertencia.",
    tecnologias: ["Java", "Paper API", "SQLite", "Discord", "LuckPerms"],
    portada: { archivo: "proyectos/nexpunish/portada.png", alt: "Portada de NexPunish" },
    capturas: [
      // Ejemplo de captura:
      // { archivo: "proyectos/nexpunish/captura-1.png", alt: "Menú de sanciones" },
    ],
    descarga: "proyectos/nexpunish/NexPunish-1.1.0.jar",
    enlaces: {
      repositorio: "",
      demo: "",
      descargaExterna: "https://modrinth.com/plugin/nexpunish",
    },
  },
];
