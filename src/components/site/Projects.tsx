import { Code2, Download, ExternalLink, Layers, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PixelMark, Reveal, Section, SectionHeading } from "@/components/site/primitives";
import {
  ETIQUETA_CATEGORIA,
  FILTROS,
  NOMBRE_CATEGORIA,
  NOMBRE_ESTADO,
  type Filtro,
  type Proyecto,
  nombreArchivo,
  rutaPublica,
} from "@/lib/proyectos";
import { cn } from "@/lib/utils";

export function Projects({ proyectos }: { proyectos: Proyecto[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [activo, setActivo] = useState<Proyecto | null>(null);

  const visibles = useMemo(
    () => proyectos.filter((p) => filtro === "todos" || p.categoria === filtro),
    [proyectos, filtro],
  );
  const cuenta = (valor: Filtro) =>
    valor === "todos" ? proyectos.length : proyectos.filter((p) => p.categoria === valor).length;

  return (
    <Section id="proyectos" grid>
      <SectionHeading
        eyebrow="Proyectos"
        title="Lo que he hecho"
        description="Proyectos terminados y otros en los que sigo trabajando. Pulsa una tarjeta para ver la ficha completa."
      />

      {proyectos.length === 0 ? (
        <Reveal className="mt-10">
          <div className="panel flex items-center gap-4 px-5 py-6">
            <PixelMark className="shrink-0 scale-150" />
            <p className="text-sm text-muted-foreground">
              Todavía no hay proyectos publicados. Pronto aparecerán aquí.
            </p>
          </div>
        </Reveal>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar proyectos">
            {FILTROS.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                aria-pressed={filtro === opcion.valor}
                onClick={() => setFiltro(opcion.valor)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 font-mono text-[11px] tracking-wide uppercase transition-colors",
                  filtro === opcion.valor
                    ? "border-primary bg-primary/12 text-primary"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {opcion.nombre}
                <span className="ml-1.5 opacity-70">{cuenta(opcion.valor)}</span>
              </button>
            ))}
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((proyecto, index) => (
              <ProjectCard
                key={proyecto.titulo}
                proyecto={proyecto}
                delay={index * 50}
                onOpen={() => setActivo(proyecto)}
              />
            ))}
          </ul>

          {visibles.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Todavía no hay proyectos en esta categoría.
            </p>
          ) : null}
        </>
      )}

      <ProjectModal proyecto={activo} onClose={() => setActivo(null)} />
    </Section>
  );
}

const botonSecundario =
  "inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-2";

export function ProjectCard({
  proyecto,
  onOpen,
  delay = 0,
}: {
  proyecto: Proyecto;
  onOpen: () => void;
  delay?: number;
}) {
  const descarga = proyecto.descarga
    ? rutaPublica(proyecto.descarga)
    : proyecto.enlaces.descargaExterna;
  return (
    <Reveal
      as="li"
      delay={delay}
      className="panel group flex flex-col overflow-hidden transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Abrir la ficha de ${proyecto.titulo}`}
        className="relative aspect-16/9 w-full cursor-pointer overflow-hidden border-b border-border bg-surface-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {proyecto.portada ? (
          <img
            src={rutaPublica(proyecto.portada.archivo)}
            alt=""
            loading="lazy"
            width={1280}
            height={720}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="bg-grid flex size-full items-center justify-center opacity-90">
            <PixelMark className="scale-[2.2]" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-sm border border-border bg-background/85 px-2 py-1 font-mono text-[10px] tracking-wide uppercase backdrop-blur">
          {ETIQUETA_CATEGORIA[proyecto.categoria]}
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-3 py-1.5 font-mono text-[11px] tracking-wide uppercase">
            <Layers className="size-3.5 text-primary" aria-hidden="true" />
            Ver ficha
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{proyecto.titulo}</h3>
          {proyecto.fecha ? (
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {proyecto.fecha}
            </span>
          ) : null}
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {proyecto.resumen}
        </p>

        {proyecto.tecnologias.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tecnologías">
            {proyecto.tecnologias.slice(0, 4).map((tech) => (
              <li
                key={tech}
                className="rounded-sm border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Layers className="size-3.5" aria-hidden="true" />
            Ver ficha
          </button>
          {descarga ? (
            <a
              href={descarga}
              {...(proyecto.descarga
                ? { download: nombreArchivo(proyecto.descarga) }
                : { target: "_blank", rel: "noreferrer" })}
              className={botonSecundario}
            >
              <Download className="size-3.5" aria-hidden="true" />
              Descargar
            </a>
          ) : null}
          {proyecto.enlaces.repositorio ? (
            <a
              href={proyecto.enlaces.repositorio}
              target="_blank"
              rel="noreferrer"
              className={botonSecundario}
            >
              <Code2 className="size-3.5" aria-hidden="true" />
              Repositorio
            </a>
          ) : null}
          <span
            className={cn(
              "ml-auto font-mono text-[10px] tracking-wide uppercase",
              proyecto.estado === "en-desarrollo" ? "text-warning" : "text-muted-foreground",
            )}
          >
            {NOMBRE_ESTADO[proyecto.estado]}
          </span>
        </div>
      </div>
    </Reveal>
  );
}

/** Ficha completa del proyecto. */
export function ProjectModal({
  proyecto,
  onClose,
}: {
  proyecto: Proyecto | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!proyecto) return;
    const anterior = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        // Mantiene el foco dentro de la ficha mientras está abierta.
        const enfocables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const primero = enfocables[0];
        const ultimo = enfocables[enfocables.length - 1];
        if (!primero || !ultimo) return;
        if (event.shiftKey && document.activeElement === primero) {
          event.preventDefault();
          ultimo.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault();
          primero.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      anterior?.focus?.();
    };
  }, [proyecto, onClose]);

  if (!proyecto) return null;
  const { enlaces } = proyecto;
  const hayBotones =
    proyecto.descarga || enlaces.descargaExterna || enlaces.repositorio || enlaces.demo;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ficha-titulo"
      className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-3xl">
        <div className="panel animate-in fade-in zoom-in-95 w-full duration-200">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-lg border-b border-border bg-surface px-5 py-4">
            <div>
              <p className="label-mono">
                {NOMBRE_CATEGORIA[proyecto.categoria]} · {NOMBRE_ESTADO[proyecto.estado]}
                {proyecto.fecha ? ` · ${proyecto.fecha}` : ""}
              </p>
              <h3 id="ficha-titulo" className="mt-1 text-xl font-semibold">
                {proyecto.titulo}
              </h3>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar la ficha"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border transition-colors hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
          </div>

          {proyecto.portada ? (
            <img
              src={rutaPublica(proyecto.portada.archivo)}
              alt={proyecto.portada.alt || `Portada de ${proyecto.titulo}`}
              width={1280}
              height={720}
              className="aspect-16/9 w-full border-b border-border object-cover"
            />
          ) : null}

          <div className="space-y-6 px-5 py-6">
            {proyecto.resumen ? (
              <p className="text-sm leading-relaxed text-foreground">{proyecto.resumen}</p>
            ) : null}

            {proyecto.problema || proyecto.aportacion ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {proyecto.problema ? (
                  <Block title="Qué quería resolver" text={proyecto.problema} />
                ) : null}
                {proyecto.aportacion ? <Block title="Qué hice" text={proyecto.aportacion} /> : null}
              </div>
            ) : null}

            {proyecto.comoProbar ? (
              <Block title="Cómo probarlo" text={proyecto.comoProbar} />
            ) : null}

            {proyecto.tecnologias.length ? (
              <div>
                <p className="label-mono">Tecnologías</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {proyecto.tecnologias.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {proyecto.capturas.length ? (
              <div>
                <p className="label-mono">Capturas</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {proyecto.capturas.map((captura) => (
                    <a
                      key={captura.archivo}
                      href={rutaPublica(captura.archivo)}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-sm border border-border"
                    >
                      <img
                        src={rutaPublica(captura.archivo)}
                        alt={captura.alt}
                        loading="lazy"
                        className="w-full"
                      />
                      <span className="sr-only"> (abrir a tamaño completo)</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {hayBotones ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                {proyecto.descarga ? (
                  <a
                    href={rutaPublica(proyecto.descarga)}
                    download={nombreArchivo(proyecto.descarga)}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    <Download className="size-3.5" aria-hidden="true" /> Descargar{" "}
                    {nombreArchivo(proyecto.descarga)}
                  </a>
                ) : null}
                {enlaces.descargaExterna ? (
                  <EnlaceExterno
                    href={enlaces.descargaExterna}
                    icono={<Download className="size-3.5" />}
                  >
                    Descarga externa
                  </EnlaceExterno>
                ) : null}
                {enlaces.repositorio ? (
                  <EnlaceExterno href={enlaces.repositorio} icono={<Code2 className="size-3.5" />}>
                    Repositorio
                  </EnlaceExterno>
                ) : null}
                {enlaces.demo ? (
                  <EnlaceExterno href={enlaces.demo} icono={<ExternalLink className="size-3.5" />}>
                    Ver demo
                  </EnlaceExterno>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnlaceExterno({
  href,
  icono,
  children,
}: {
  href: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-sm border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-2"
    >
      <span aria-hidden="true">{icono}</span> {children}
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="label-mono">{title}</p>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
