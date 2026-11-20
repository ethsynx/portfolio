import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Linea = { etiqueta: string; texto: string; ok?: boolean };

const COMANDOS: Record<string, { descripcion: string; lineas: Linea[] }> = {
  "/spawn": {
    descripcion: "Plugin de Minecraft",
    lineas: [
      { etiqueta: "PLUGIN", texto: "Teletransportando a Visitante…" },
      { etiqueta: "PLUGIN", texto: "Teletransportado al spawn · X 0 · Y 64 · Z 0", ok: true },
    ],
  },
  "/bienvenida": {
    descripcion: "Bot de Discord",
    lineas: [
      { etiqueta: "DISCORD", texto: "Visitante se ha unido al servidor" },
      { etiqueta: "BOT", texto: "¡Te damos la bienvenida, Visitante!" },
      { etiqueta: "BOT", texto: "Lee #normas y preséntate en #presentaciones.", ok: true },
    ],
  },
  "/servidor": {
    descripcion: "Network y splitter",
    lineas: [
      { etiqueta: "ENTRADA", texto: "play.example.net:25565" },
      { etiqueta: "PROXY", texto: "Velocity · modalidad pedida: survival" },
      { etiqueta: "SPLITTER", texto: "survival-1 34/60 · survival-2 12/60 → survival-2" },
      { etiqueta: "DESTINO", texto: "Conectado a survival-2", ok: true },
    ],
  },
};

const LISTA = Object.keys(COMANDOS);

/** Mini demo de consola: cada comando muestra una respuesta simulada. */
export function Terminal() {
  const [comando, setComando] = useState<string | null>(null);
  const [escrito, setEscrito] = useState("");
  const [visibles, setVisibles] = useState(0);
  const [anuncio, setAnuncio] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const temporizadores = useRef<number[]>([]);
  const usado = useRef(false);

  const limpiar = () => {
    temporizadores.current.forEach((t) => window.clearTimeout(t));
    temporizadores.current = [];
  };

  const ejecutar = useCallback((nuevo: string) => {
    limpiar();
    const datos = COMANDOS[nuevo];
    if (!datos) return;
    usado.current = true;
    setComando(nuevo);
    setAnuncio("");
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resumen = `Simulación de ${nuevo}: ${datos.lineas.map((l) => l.texto).join(". ")}`;
    if (reducido) {
      setEscrito(nuevo);
      setVisibles(datos.lineas.length);
      setAnuncio(resumen);
      return;
    }
    setEscrito("");
    setVisibles(0);
    const programar = (fn: () => void, ms: number) =>
      temporizadores.current.push(window.setTimeout(fn, ms));
    const pasoEscritura = 55;
    for (let i = 1; i <= nuevo.length; i++)
      programar(() => setEscrito(nuevo.slice(0, i)), i * pasoEscritura);
    const inicio = nuevo.length * pasoEscritura + 180;
    datos.lineas.forEach((_, i) => programar(() => setVisibles(i + 1), inicio + i * 260));
    programar(() => setAnuncio(resumen), inicio + datos.lineas.length * 260);
  }, []);

  // Como en el template: empieza a escribir cuando la consola entra en pantalla.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        if (!usado.current) ejecutar("/spawn");
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      limpiar();
    };
  }, [ejecutar]);

  const datos = comando ? COMANDOS[comando] : null;
  const escribiendo = comando !== null && escrito.length < comando.length;

  return (
    <div ref={ref} className="panel overflow-hidden font-mono text-[13px]">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="label-mono">consola</span>
        <span className="text-right font-mono text-[11px] text-muted-foreground">
          demo · respuestas simuladas
        </span>
      </div>

      <div className="min-h-[11.5rem] space-y-1.5 px-4 py-4">
        <p className="text-foreground">
          <span className="text-muted-foreground">$ </span>
          <span className="text-primary">{escrito}</span>
          {escribiendo || comando === null ? <span className="caret text-primary">▌</span> : null}
        </p>
        {datos ? (
          <div className="space-y-1.5">
            {datos.lineas.map((linea, i) => (
              <p
                key={`${comando}-${i}`}
                className="flex gap-4 transition-opacity duration-300"
                style={{ opacity: i < visibles ? 1 : 0 }}
                aria-hidden={i >= visibles}
              >
                <span className="w-20 shrink-0 text-muted-foreground">{linea.etiqueta}</span>
                <span className={linea.ok ? "text-success" : "text-foreground"}>{linea.texto}</span>
              </p>
            ))}
            <p
              className="pt-1 text-[11px] text-muted-foreground transition-opacity duration-300"
              style={{ opacity: visibles >= datos.lineas.length ? 1 : 0 }}
            >
              # simulación de {datos.descripcion.toLowerCase()}: no se conecta a ningún servidor
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border px-4 py-3">
        <p id="terminal-ayuda" className="label-mono">
          Elige un comando
        </p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-describedby="terminal-ayuda">
          {LISTA.map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => ejecutar(opcion)}
              aria-pressed={comando === opcion}
              className={cn(
                "rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors",
                comando === opcion
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {opcion}
              <span className="sr-only"> ({COMANDOS[opcion]?.descripcion})</span>
            </button>
          ))}
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </div>
  );
}
