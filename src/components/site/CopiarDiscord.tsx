import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* se intenta el método antiguo */
  }
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;font-size:16px";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/**
 * Botón «Copiar Discord» + usuario visible y seleccionable a mano.
 * Copia exactamente el usuario de siteConfig.contact.discord.
 */
export function CopiarDiscord({
  variante = "contorno",
  className,
  mostrarUsuario = true,
  idObjetivo,
}: {
  variante?: "primario" | "contorno";
  className?: string;
  mostrarUsuario?: boolean;
  /** Si el usuario se muestra en otro sitio, id del elemento a seleccionar si falla el copiado. */
  idObjetivo?: string;
}) {
  const usuario = siteConfig.contact.discord;
  const [estado, setEstado] = useState<"inicial" | "copiado" | "error">("inicial");
  const usuarioRef = useRef<HTMLSpanElement>(null);
  const temporizador = useRef<number | undefined>(undefined);
  const idUsuario = useId();

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const copiar = async () => {
    const ok = await copiarTexto(usuario);
    window.clearTimeout(temporizador.current);
    if (ok) {
      setEstado("copiado");
      temporizador.current = window.setTimeout(() => setEstado("inicial"), 2400);
    } else {
      setEstado("error");
      const el = usuarioRef.current ?? (idObjetivo ? document.getElementById(idObjetivo) : null);
      if (el) {
        const rango = document.createRange();
        rango.selectNodeContents(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(rango);
      }
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <button
        type="button"
        onClick={copiar}
        aria-describedby={mostrarUsuario ? idUsuario : idObjetivo}
        className={cn(
          "inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-medium transition-colors",
          variante === "primario"
            ? "bg-primary text-primary-foreground hover:bg-primary-hover"
            : "border border-border-strong hover:bg-surface-2",
          estado === "copiado" && variante === "contorno" && "border-success/60 text-success",
        )}
      >
        {estado === "copiado" ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {estado === "copiado" ? "Copiado" : "Copiar Discord"}
      </button>
      {mostrarUsuario ? (
        <span id={idUsuario} className="font-mono text-xs text-muted-foreground">
          Discord:{" "}
          <span
            ref={usuarioRef}
            className="rounded-sm border border-border bg-surface-2 px-1.5 py-0.5 text-foreground select-all"
          >
            {usuario}
          </span>
        </span>
      ) : null}
      <span
        role="status"
        aria-live="polite"
        className={cn(estado === "error" ? "basis-full text-xs text-muted-foreground" : "sr-only")}
      >
        {estado === "copiado"
          ? `Usuario de Discord copiado: ${usuario}`
          : estado === "error"
            ? "No se ha podido copiar automáticamente. El usuario está seleccionado: cópialo con Ctrl+C o manteniendo pulsado."
            : ""}
      </span>
    </div>
  );
}
