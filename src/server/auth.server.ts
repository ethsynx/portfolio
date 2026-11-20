import crypto from "node:crypto";

import {
  deleteCookie,
  getCookie,
  getRequestIP,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";

import { baseDeDatos } from "./db.server";
import { entorno } from "./entorno.server";

const COOKIE = "sesion_admin";
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

/* ------------------------------------------------------------ contraseñas */

/** Formato: scrypt:N:r:p:sal:hash (base64url). Lo genera `npm run admin:configurar`. */
function verificarContrasena(contrasena: string, almacenado: string): boolean {
  const partes = almacenado.split(":");
  // Hash de relleno para que el tiempo de respuesta no delate si el formato es válido.
  const [tipo, nTexto, rTexto, pTexto, sal, hash] =
    partes.length === 6 ? partes : ["scrypt", "16384", "8", "1", "AAAAAAAAAAAAAAAAAAAAAA", "AAAA"];
  if (tipo !== "scrypt" || !sal || !hash) return false;
  const N = Number(nTexto);
  const r = Number(rTexto);
  const p = Number(pTexto);
  const esperado = Buffer.from(hash, "base64url");
  if (!esperado.length || !Number.isInteger(N) || N < 16384) return false;
  const calculado = crypto.scryptSync(contrasena, Buffer.from(sal, "base64url"), esperado.length, {
    N,
    r,
    p,
    maxmem: 128 * N * r * 2,
  });
  return crypto.timingSafeEqual(calculado, esperado) && partes.length === 6;
}

function sha256(texto: string): Buffer {
  return crypto.createHash("sha256").update(texto).digest();
}

/** Cambia cuando cambias usuario o contraseña: invalida las sesiones antiguas. */
function huellaCredenciales(): string {
  const { adminUsuario, adminHash } = entorno();
  return sha256(`${adminUsuario}\n${adminHash}`).toString("hex").slice(0, 32);
}

export function accesoConfigurado(): boolean {
  const { adminUsuario, adminHash } = entorno();
  return adminUsuario.length > 0 && adminHash.startsWith("scrypt:");
}

/* --------------------------------------------- límite de intentos de acceso */

const intentos = new Map<string, { fallos: number; bloqueadoHasta: number; ultimo: number }>();

function claveCliente(): string {
  return getRequestIP({ xForwardedFor: entorno().confiarProxy }) ?? "desconocido";
}

function segundosDeBloqueo(clave: string): number {
  const registro = intentos.get(clave);
  if (!registro) return 0;
  const resto = registro.bloqueadoHasta - Date.now();
  return resto > 0 ? Math.ceil(resto / 1000) : 0;
}

function registrarFallo(clave: string) {
  const ahora = Date.now();
  const previo = intentos.get(clave);
  const fallos = previo && ahora - previo.ultimo < BLOQUEO_MS ? previo.fallos + 1 : 1;
  intentos.set(clave, {
    fallos,
    ultimo: ahora,
    bloqueadoHasta: fallos >= MAX_FALLOS ? ahora + BLOQUEO_MS : 0,
  });
  if (intentos.size > 5000) intentos.clear();
}

/* ----------------------------------------------------------------- sesiones */

function tokenHash(token: string): string {
  return sha256(token).toString("hex");
}

export type ResultadoAcceso = { ok: true } | { ok: false; error: string };

export function iniciarSesion(usuario: string, contrasena: string): ResultadoAcceso {
  if (!accesoConfigurado()) {
    return { ok: false, error: "El acceso todavía no está configurado en el servidor." };
  }
  const clave = claveCliente();
  const espera = segundosDeBloqueo(clave);
  if (espera > 0) {
    return {
      ok: false,
      error: `Demasiados intentos. Vuelve a probar en ${Math.ceil(espera / 60)} min.`,
    };
  }

  const { adminUsuario, adminHash } = entorno();
  const usuarioOk = crypto.timingSafeEqual(sha256(usuario.trim()), sha256(adminUsuario));
  const contrasenaOk = verificarContrasena(contrasena, adminHash); // siempre se calcula
  if (!usuarioOk || !contrasenaOk) {
    registrarFallo(clave);
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }
  intentos.delete(clave);

  const token = crypto.randomBytes(32).toString("base64url");
  const ahora = Date.now();
  const db = baseDeDatos();
  db.prepare("DELETE FROM sesiones WHERE expira_en < ?").run(ahora);
  db.prepare(
    "INSERT INTO sesiones (token_hash, huella, creada_en, expira_en) VALUES (?, ?, ?, ?)",
  ).run(tokenHash(token), huellaCredenciales(), ahora, ahora + DURACION_MS);
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: getRequestProtocol({ xForwardedProto: entorno().confiarProxy }) === "https",
    path: "/",
    maxAge: DURACION_MS / 1000,
  });
  return { ok: true };
}

export function sesionActiva(): boolean {
  if (!accesoConfigurado()) return false;
  const token = getCookie(COOKIE);
  if (!token || token.length > 100) return false;
  const fila = baseDeDatos()
    .prepare("SELECT 1 AS ok FROM sesiones WHERE token_hash = ? AND huella = ? AND expira_en > ?")
    .get(tokenHash(token), huellaCredenciales(), Date.now());
  return Boolean(fila);
}

export function cerrarSesion() {
  const token = getCookie(COOKIE);
  if (token)
    baseDeDatos().prepare("DELETE FROM sesiones WHERE token_hash = ?").run(tokenHash(token));
  deleteCookie(COOKIE, { path: "/" });
}

export class NoAutorizado extends Error {
  constructor() {
    super("Necesitas iniciar sesión en el panel.");
    this.name = "NoAutorizado";
  }
}

/** Úsalo al principio de cualquier operación privada. */
export function exigirAdmin() {
  if (!sesionActiva()) throw new NoAutorizado();
}
