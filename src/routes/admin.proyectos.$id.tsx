import { createFileRoute } from "@tanstack/react-router";

import { EditorProyecto } from "@/components/admin/EditorProyecto";
import { obtenerProyectoAdmin } from "@/lib/api";

export const Route = createFileRoute("/admin/proyectos/$id")({
  loader: async ({ params, context }) => {
    if (!context.acceso.autenticado) return null;
    if (params.id === "nuevo") return { ok: true as const, datos: null };
    return obtenerProyectoAdmin({ data: { id: params.id } });
  },
  staleTime: 0,
  component: PaginaEditor,
});

function PaginaEditor() {
  const resultado = Route.useLoaderData();
  const { id } = Route.useParams();
  if (!resultado) return null;
  if (!resultado.ok) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {resultado.error}
      </p>
    );
  }
  if (id !== "nuevo" && !resultado.datos) {
    return (
      <p className="text-sm text-muted-foreground">Ese proyecto no existe o se ha eliminado.</p>
    );
  }
  // key: al pasar de «nuevo» al proyecto recién creado se reinicia el formulario con los datos guardados.
  return (
    <EditorProyecto key={resultado.datos?.actualizadoEn ?? "nuevo"} proyecto={resultado.datos} />
  );
}
