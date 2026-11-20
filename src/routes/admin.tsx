import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { ExternalLink, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

import {
  Campo,
  claseBotonContorno,
  claseBotonPrimario,
  claseCampo,
} from "@/components/admin/comun";
import { Logo } from "@/components/site/Logo";
import { PixelMark } from "@/components/site/primitives";
import { siteConfig } from "@/config/site";
import { cerrarSesionFn, iniciarSesionFn, obtenerEstadoAdmin } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => ({ acceso: await obtenerEstadoAdmin() }),
  head: () => ({
    meta: [
      { title: `Panel · ${siteConfig.studio}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { acceso } = Route.useRouteContext();
  const router = useRouter();

  const salir = async () => {
    await cerrarSesionFn();
    await router.invalidate();
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-80 opacity-40 [mask-image:radial-gradient(120%_80%_at_50%_0%,black,transparent_70%)]"
      />
      <header className="relative border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 font-display text-sm font-semibold"
          >
            <span className="flex size-8 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
              <Logo className="h-3.5" />
            </span>
            {siteConfig.studio} · Panel
          </Link>
          <a
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            <span>Ver la web</span>
          </a>
          {acceso.autenticado ? (
            <button type="button" onClick={salir} className={`${claseBotonContorno} py-2`}>
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sr-only sm:hidden">Cerrar sesión</span>
            </button>
          ) : null}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {!acceso.configurado ? <SinConfigurar /> : acceso.autenticado ? <Outlet /> : <Acceso />}
      </main>
    </div>
  );
}

function SinConfigurar() {
  return (
    <div className="panel mx-auto max-w-lg p-6">
      <PixelMark />
      <h1 className="mt-4 text-2xl font-semibold">Acceso sin configurar</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Todavía no hay usuario administrador. En la carpeta del proyecto ejecuta:
      </p>
      <pre className="mt-3 rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-xs">
        npm run admin:configurar
      </pre>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Después recarga esta página.
      </p>
    </div>
  );
}

function Acceso() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const entrar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setOcupado(true);
    setError("");
    try {
      const resultado = await iniciarSesionFn({ data: { usuario, contrasena } });
      if (resultado.ok) {
        await router.invalidate();
        return;
      }
      setError(resultado.error);
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form
      onSubmit={entrar}
      className="panel mx-auto mt-6 max-w-sm space-y-4 p-6"
      aria-labelledby="acceso-titulo"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-primary" aria-hidden="true" />
          <span className="label-mono text-primary">Privado</span>
        </div>
        <h1 id="acceso-titulo" className="mt-3 text-2xl font-semibold">
          Inicia sesión
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panel para gestionar los proyectos del portfolio.
        </p>
      </div>
      <Campo etiqueta="Usuario" htmlFor="acceso-usuario">
        <input
          id="acceso-usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          className={claseCampo(Boolean(error))}
        />
      </Campo>
      <Campo etiqueta="Contraseña" htmlFor="acceso-contrasena">
        <input
          id="acceso-contrasena"
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          autoComplete="current-password"
          required
          className={claseCampo(Boolean(error))}
        />
      </Campo>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={ocupado} className={`${claseBotonPrimario} w-full`}>
        <LogIn className="size-4" aria-hidden="true" />
        {ocupado ? "Comprobando…" : "Entrar"}
      </button>
    </form>
  );
}
