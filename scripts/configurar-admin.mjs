#!/usr/bin/env node
/**
 * Configura el acceso privado a /admin.
 *
 *   npm run admin:configurar
 *
 * Pide usuario y contraseña y guarda en .env SOLO el hash (scrypt) de la
 * contraseña. Si vuelves a ejecutarlo, se cambian las credenciales y se
 * cierran todas las sesiones abiertas.
 *
 * Uso sin preguntas (p. ej. en un servidor):
 *   ADMIN_USUARIO=diego ADMIN_CONTRASENA='...' npm run admin:configurar
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const RUTA_ENV = path.resolve(".env");
const MIN_CONTRASENA = 12;

function preguntar(texto, { oculto = false } = {}) {
  return new Promise((resolver) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    if (oculto) {
      // Oculta lo que se escribe (muestra * por cada carácter).
      rl._writeToOutput = (cadena) => {
        if (cadena.includes(texto)) rl.output.write(cadena);
        else if (cadena === "\r\n" || cadena === "\n") rl.output.write(cadena);
        else rl.output.write("*".repeat(cadena.length));
      };
    }
    rl.question(texto, (respuesta) => {
      rl.close();
      if (oculto) process.stdout.write("\n");
      resolver(respuesta);
    });
  });
}

function hashear(contrasena) {
  const N = 32768;
  const r = 8;
  const p = 1;
  const sal = crypto.randomBytes(16);
  const hash = crypto.scryptSync(contrasena, sal, 32, { N, r, p, maxmem: 128 * N * r * 2 });
  return `scrypt:${N}:${r}:${p}:${sal.toString("base64url")}:${hash.toString("base64url")}`;
}

function guardarEnv(valores) {
  const lineas = fs.existsSync(RUTA_ENV) ? fs.readFileSync(RUTA_ENV, "utf8").split(/\r?\n/) : [];
  for (const [clave, valor] of Object.entries(valores)) {
    const linea = `${clave}=${valor}`;
    const indice = lineas.findIndex((l) => l.startsWith(`${clave}=`));
    if (indice >= 0) lineas[indice] = linea;
    else lineas.push(linea);
  }
  const contenido = lineas.filter((l, i) => l !== "" || i < lineas.length - 1).join("\n") + "\n";
  fs.writeFileSync(RUTA_ENV, contenido, { mode: 0o600 });
}

async function main() {
  console.log("Configurar acceso al panel /admin\n");
  let usuario = process.env.ADMIN_USUARIO?.trim() || (await preguntar("Usuario: ")).trim();
  if (!/^[\w.-]{3,40}$/.test(usuario)) {
    console.error(
      "El usuario debe tener entre 3 y 40 caracteres: letras, números, puntos, guiones o guiones bajos.",
    );
    process.exit(1);
  }

  let contrasena = process.env.ADMIN_CONTRASENA;
  if (!contrasena) {
    contrasena = await preguntar(`Contraseña (mínimo ${MIN_CONTRASENA} caracteres): `, {
      oculto: true,
    });
    const repetida = await preguntar("Repite la contraseña: ", { oculto: true });
    if (contrasena !== repetida) {
      console.error("Las contraseñas no coinciden.");
      process.exit(1);
    }
  }
  if (contrasena.length < MIN_CONTRASENA) {
    console.error(`La contraseña necesita al menos ${MIN_CONTRASENA} caracteres.`);
    process.exit(1);
  }
  if (contrasena.toLowerCase().includes(usuario.toLowerCase())) {
    console.error("La contraseña no puede contener el usuario.");
    process.exit(1);
  }

  guardarEnv({ ADMIN_USUARIO: usuario, ADMIN_HASH: hashear(contrasena) });
  console.log(`\nListo. Credenciales guardadas en ${RUTA_ENV} (solo el hash, no la contraseña).`);
  console.log("Recarga la página del panel para entrar. Las sesiones abiertas se han cerrado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
