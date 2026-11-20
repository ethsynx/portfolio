import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { entorno } from "./entorno.server";

const ESQUEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 3000;

CREATE TABLE IF NOT EXISTS proyectos (
  id                TEXT PRIMARY KEY,
  titulo            TEXT NOT NULL,
  categoria         TEXT NOT NULL CHECK (categoria IN ('plugins', 'bots', 'networks')),
  resumen           TEXT NOT NULL DEFAULT '',
  problema          TEXT NOT NULL DEFAULT '',
  aportacion        TEXT NOT NULL DEFAULT '',
  como_probar       TEXT NOT NULL DEFAULT '',
  tecnologias       TEXT NOT NULL DEFAULT '[]',
  fecha             TEXT NOT NULL DEFAULT '',
  estado_desarrollo TEXT NOT NULL CHECK (estado_desarrollo IN ('en-desarrollo', 'terminado')),
  publicado         INTEGER NOT NULL DEFAULT 0,
  repositorio       TEXT NOT NULL DEFAULT '',
  demo              TEXT NOT NULL DEFAULT '',
  descarga_externa  TEXT NOT NULL DEFAULT '',
  creado_en         TEXT NOT NULL,
  actualizado_en    TEXT NOT NULL,
  publicado_en      TEXT
);

CREATE TABLE IF NOT EXISTS archivos (
  id          TEXT PRIMARY KEY,
  proyecto_id TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('portada', 'captura', 'descarga')),
  nombre      TEXT NOT NULL,
  mime        TEXT NOT NULL,
  tamano      INTEGER NOT NULL,
  alt         TEXT NOT NULL DEFAULT '',
  posicion    INTEGER NOT NULL DEFAULT 0,
  creado_en   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS archivos_proyecto ON archivos (proyecto_id, tipo, posicion);

CREATE TABLE IF NOT EXISTS sesiones (
  token_hash TEXT PRIMARY KEY,
  huella     TEXT NOT NULL,
  creada_en  INTEGER NOT NULL,
  expira_en  INTEGER NOT NULL
);
`;

// Se guarda en globalThis para no abrir varias conexiones al recargar en desarrollo.
const clave = Symbol.for("portfolio-diego.db");
type ConCache = typeof globalThis & { [clave]?: DatabaseSync };

export function baseDeDatos(): DatabaseSync {
  const global = globalThis as ConCache;
  if (global[clave]) return global[clave];
  const { dirDatos } = entorno();
  fs.mkdirSync(path.join(dirDatos, "archivos"), { recursive: true });
  const db = new DatabaseSync(path.join(dirDatos, "portfolio.db"));
  db.exec(ESQUEMA);
  global[clave] = db;
  return db;
}

export function dirArchivos(): string {
  return path.join(entorno().dirDatos, "archivos");
}

/** Ejecuta varias operaciones como una sola: o se guardan todas o ninguna. */
export function transaccion<T>(fn: () => T): T {
  const db = baseDeDatos();
  db.exec("BEGIN IMMEDIATE");
  try {
    const resultado = fn();
    db.exec("COMMIT");
    return resultado;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
