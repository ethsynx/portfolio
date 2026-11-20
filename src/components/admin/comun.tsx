import { Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { eliminarProyectoFn } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Mismo estilo que los campos del formulario de contacto del template. */
export const claseCampo = (invalido?: boolean) =>
  cn(
    "w-full rounded-sm border bg-surface-2 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground/70 sm:text-sm",
    invalido ? "border-destructive" : "border-border focus:border-border-strong",
  );

export function Campo({
  etiqueta,
  htmlFor,
  ayuda,
  opcional,
  children,
}: {
  etiqueta: string;
  htmlFor: string;
  ayuda?: string;
  opcional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label-mono mb-2 block">
        {etiqueta}
        {opcional ? <span className="normal-case"> (opcional)</span> : null}
      </label>
      {children}
      {ayuda ? (
        <p id={`${htmlFor}-ayuda`} className="mt-1.5 text-xs text-muted-foreground">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

export const claseBotonPrimario =
  "inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";
export const claseBotonContorno =
  "inline-flex items-center justify-center gap-2 rounded-sm border border-border-strong px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-60";
export const claseBotonPeligro =
  "inline-flex items-center justify-center gap-2 rounded-sm border border-destructive/50 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60";

export function Insignia({
  tono,
  children,
}: {
  tono: "exito" | "aviso" | "neutro";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase",
        tono === "exito" && "border-success/40 text-success",
        tono === "aviso" && "border-warning/40 text-warning",
        tono === "neutro" && "border-border text-muted-foreground",
      )}
    >
      {tono === "exito" ? (
        <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}

/** Botón «Eliminar» que pide confirmación antes de borrar para siempre. */
export function EliminarProyecto({
  id,
  titulo,
  onEliminado,
  className,
}: {
  id: string;
  titulo: string;
  onEliminado: () => void;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const confirmar = async (evento: React.MouseEvent) => {
    evento.preventDefault();
    setOcupado(true);
    setError("");
    const resultado = await eliminarProyectoFn({ data: { id } });
    setOcupado(false);
    if (resultado.ok) {
      setAbierto(false);
      onEliminado();
    } else {
      setError(resultado.error);
    }
  };

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger asChild>
        <button type="button" className={cn(claseBotonPeligro, className)}>
          <Trash2 className="size-4" aria-hidden="true" />
          Eliminar
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="panel rounded-lg border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            ¿Eliminar «{titulo}» para siempre?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán la ficha, la portada, las capturas y la descarga. No se puede deshacer. Si
            solo quieres quitarlo de la web, usa «Retirar de la web».
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={claseBotonContorno}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            disabled={ocupado}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            {ocupado ? "Eliminando…" : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
