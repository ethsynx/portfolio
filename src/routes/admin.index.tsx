import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, Plus, Send } from "lucide-react";
import { useState } from "react";

import {
  EliminarProyecto,
  Insignia,
  claseBotonContorno,
  claseBotonPrimario,
} from "@/components/admin/comun";
import { ProjectModal } from "@/components/site/Projects";
import { PixelMark } from "@/components/site/primitives";
import { cambiarPublicacionFn, listarProyectosAdmin } from "@/lib/api";
import { NOMBRE_CATEGORIA, NOMBRE_ESTADO, type Proyecto } from "@/lib/proyectos";

export const Route = createFileRoute("/admin/")({
  loader: ({ context }) => (context.acceso.autenticado ? listarProyectosAdmin() : null),
  staleTime: 0,
  component: ListaProyectos,
});

function ListaProyectos() {
  const resultado = Route.useLoaderData();
  const router = useRouter();
  const [vista, setVista] = useState<Proyecto | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; error?: boolean }>({ texto: "" });

  if (!resultado) return null;
  if (!resultado.ok) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {resultado.error}
      </p>
    );
  }
  const proyectos = resultado.datos;

  const publicar = async (proyecto: Proyecto, publicarlo: boolean) => {
    const r = await cambiarPublicacionFn({ data: { id: proyecto.id, publicar: publicarlo } });
    setAviso(
      r.ok
        ? {
            texto: publicarlo
              ? `«${proyecto.titulo}» ya está publicado.`
              : `«${proyecto.titulo}» se ha retirado de la web. Sigue guardado como borrador.`,
          }
        : { texto: r.error, error: true },
    );
    await router.invalidate();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-primary" aria-hidden="true" />
            <span className="label-mono text-primary">Proyectos</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold">Tus proyectos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Los borradores solo los ves tú. Al publicar, aparecen al momento en la web.
          </p>
        </div>
        <Link to="/admin/proyectos/$id" params={{ id: "nuevo" }} className={claseBotonPrimario}>
          <Plus className="size-4" aria-hidden="true" />
          Nuevo proyecto
        </Link>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`mt-4 min-h-5 text-sm ${aviso.error ? "text-destructive" : "text-success"}`}
      >
        {aviso.texto}
      </p>

      {proyectos.length === 0 ? (
        <div className="panel mt-4 flex items-center gap-4 px-5 py-6">
          <PixelMark className="shrink-0 scale-150" />
          <p className="text-sm text-muted-foreground">
            Aún no has creado ningún proyecto. Empieza con «Nuevo proyecto».
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {proyectos.map((proyecto) => (
            <li
              key={proyecto.id}
              className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <div className="aspect-16/9 w-full shrink-0 overflow-hidden rounded-sm border border-border bg-surface-2 sm:w-40">
                {proyecto.portada ? (
                  <img src={proyecto.portada.url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="bg-grid flex size-full items-center justify-center">
                    <PixelMark className="scale-150" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {proyecto.publicado ? (
                    <Insignia tono="exito">Publicado</Insignia>
                  ) : (
                    <Insignia tono="neutro">Borrador</Insignia>
                  )}
                  <Insignia
                    tono={proyecto.estadoDesarrollo === "en-desarrollo" ? "aviso" : "neutro"}
                  >
                    {NOMBRE_ESTADO[proyecto.estadoDesarrollo]}
                  </Insignia>
                </div>
                <h2 className="mt-2 truncate text-lg font-semibold">{proyecto.titulo}</h2>
                <p className="label-mono mt-1">
                  {NOMBRE_CATEGORIA[proyecto.categoria]}
                  {proyecto.fecha ? ` · ${proyecto.fecha}` : ""} · {proyecto.capturas.length}{" "}
                  {proyecto.capturas.length === 1 ? "captura" : "capturas"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/admin/proyectos/$id"
                  params={{ id: proyecto.id }}
                  className={claseBotonContorno}
                  aria-label={`Editar ${proyecto.titulo}`}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setVista(proyecto)}
                  className={claseBotonContorno}
                  aria-label={`Vista previa de ${proyecto.titulo}`}
                >
                  <Eye className="size-4" aria-hidden="true" />
                  Vista previa
                </button>
                {proyecto.publicado ? (
                  <button
                    type="button"
                    onClick={() => publicar(proyecto, false)}
                    className={claseBotonContorno}
                  >
                    <EyeOff className="size-4" aria-hidden="true" />
                    Retirar de la web
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => publicar(proyecto, true)}
                    className={claseBotonPrimario}
                  >
                    <Send className="size-4" aria-hidden="true" />
                    Publicar
                  </button>
                )}
                <EliminarProyecto
                  id={proyecto.id}
                  titulo={proyecto.titulo}
                  onEliminado={async () => {
                    setAviso({ texto: `«${proyecto.titulo}» se ha eliminado.` });
                    await router.invalidate();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProjectModal proyecto={vista} onClose={() => setVista(null)} vistaPrevia />
    </div>
  );
}
