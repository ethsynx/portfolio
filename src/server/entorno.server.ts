import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

let ultimaVersion = "";

/**
 * Relee `.env` si ha cambiado desde la última vez. Así, tras ejecutar
 * `npm run admin:configurar`, basta con recargar la página: no hace falta
 * reiniciar la web.
 */
function cargarEnv() {
  try {
    if (!fs.existsSync(".env")) return;
    const { mtimeMs, size } = fs.statSync(".env");
    const version = `${mtimeMs}:${size}`;
    if (version === ultimaVersion) return;
    ultimaVersion = version;
    const valores = parseEnv(fs.readFileSync(".env", "utf8"));
    for (const [clave, valor] of Object.entries(valores)) process.env[clave] = valor;
  } catch (error) {
    console.error("No se ha podido leer .env:", error);
  }
}

/**
 * Variables de entorno del servidor. Se leen de `.env` (si existe) en la
 * carpeta desde la que arrancas la web, o del propio entorno del sistema.
 */
export function entorno() {
  cargarEnv();
  return {
    /** Carpeta persistente con la base de datos y los archivos subidos. */
    dirDatos: path.resolve(process.env["DATA_DIR"] || "datos"),
    adminUsuario: (process.env["ADMIN_USUARIO"] ?? "").trim(),
    adminHash: (process.env["ADMIN_HASH"] ?? "").trim(),
    /** Pon TRUST_PROXY=1 solo si la web está detrás de un proxy inverso (Nginx, Caddy…). */
    confiarProxy: process.env["TRUST_PROXY"] === "1",
  };
}
