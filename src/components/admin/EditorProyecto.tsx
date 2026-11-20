import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, ImagePlus, Save, Send, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Campo,
  EliminarProyecto,
  Insignia,
  claseBotonContorno,
  claseBotonPrimario,
  claseCampo,
} from "@/components/admin/comun";
import { ProjectCard, ProjectModal } from "@/components/site/Projects";
import { cambiarPublicacionFn, guardarProyectoFn } from "@/lib/api";
import {
  CATEGORIAS,
  ESTADOS_DESARROLLO,
  EXTENSIONES_DESCARGA,
  LIMITES,
  NOMBRE_CATEGORIA,
  NOMBRE_ESTADO,
  type Archivo,
  type Categoria,
  type EstadoDesarrollo,
  type Proyecto,
  formatearTamano,
} from "@/lib/proyectos";
import { cn } from "@/lib/utils";

const TIPOS_IMAGEN = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const claseArchivo =
  "block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-sm file:border file:border-border-strong file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-surface-2";

// Mensaje que sobrevive al recargar el editor tras guardar.
let mensajePendiente: { tipo: "ok" | "error"; texto: string } | null = null;

type Campos = {
  titulo: string;
  categoria: Categoria;
  resumen: string;
  problema: string;
  aportacion: string;
  comoProbar: string;
  tecnologias: string;
  fecha: string;
  estadoDesarrollo: EstadoDesarrollo;
  repositorio: string;
  demo: string;
  descargaExterna: string;
};

function comprobarImagen(archivo: File): string | null {
  if (archivo.type && !TIPOS_IMAGEN.includes(archivo.type))
    return `«${archivo.name}»: usa PNG, JPG, WebP o GIF.`;
  if (archivo.size > LIMITES.imagenBytes)
    return `«${archivo.name}»: supera ${formatearTamano(LIMITES.imagenBytes)}.`;
  return null;
}

function comprobarDescarga(archivo: File): string | null {
  const nombre = archivo.name.toLowerCase();
  if (!EXTENSIONES_DESCARGA.some((ext) => nombre.endsWith(ext))) {
    return `«${archivo.name}»: formatos admitidos ${EXTENSIONES_DESCARGA.join(", ")}.`;
  }
  if (archivo.size > LIMITES.descargaBytes)
    return `«${archivo.name}»: supera ${formatearTamano(LIMITES.descargaBytes)}.`;
  return null;
}

/** URLs temporales para ver en el navegador archivos que aún no se han subido. */
function useUrlsLocales(archivos: (File | null)[]) {
  const urls = useMemo(() => archivos.map((a) => (a ? URL.createObjectURL(a) : "")), [archivos]);
  useEffect(() => () => urls.forEach((u) => u && URL.revokeObjectURL(u)), [urls]);
  return urls;
}

function archivoLocal(id: string, archivo: File, url: string, alt: string): Archivo {
  return { id, url, nombre: archivo.name, tamano: archivo.size, tipo: archivo.type, alt };
}

export function EditorProyecto({ proyecto }: { proyecto: Proyecto | null }) {
  const router = useRouter();
  const navigate = useNavigate();

  const [campos, setCampos] = useState<Campos>({
    titulo: proyecto?.titulo ?? "",
    categoria: proyecto?.categoria ?? "plugins",
    resumen: proyecto?.resumen ?? "",
    problema: proyecto?.problema ?? "",
    aportacion: proyecto?.aportacion ?? "",
    comoProbar: proyecto?.comoProbar ?? "",
    tecnologias: proyecto?.tecnologias.join(", ") ?? "",
    fecha: proyecto?.fecha ?? String(new Date().getFullYear()),
    estadoDesarrollo: proyecto?.estadoDesarrollo ?? "en-desarrollo",
    repositorio: proyecto?.enlaces.repositorio ?? "",
    demo: proyecto?.enlaces.demo ?? "",
    descargaExterna: proyecto?.enlaces.descargaExterna ?? "",
  });
  const [portadaNueva, setPortadaNueva] = useState<File | null>(null);
  const [quitarPortada, setQuitarPortada] = useState(false);
  const [capturasNuevas, setCapturasNuevas] = useState<File[]>([]);
  const [quitarCapturas, setQuitarCapturas] = useState<string[]>([]);
  const [altCapturas, setAltCapturas] = useState<Record<string, string>>({});
  const [descargaNueva, setDescargaNueva] = useState<File | null>(null);
  const [quitarDescarga, setQuitarDescarga] = useState(false);
  const [mensaje, setMensaje] = useState(() => mensajePendiente);
  useEffect(() => {
    mensajePendiente = null;
  }, []);
  const [ocupado, setOcupado] = useState<null | "guardar" | "publicar" | "retirar">(null);
  const [sucio, setSucio] = useState(false);
  const [vista, setVista] = useState<Proyecto | null>(null);

  const listaLocal = useMemo(
    () => [portadaNueva, descargaNueva, ...capturasNuevas],
    [portadaNueva, descargaNueva, capturasNuevas],
  );
  const [urlPortada = "", urlDescarga = "", ...urlsCapturas] = useUrlsLocales(listaLocal);

  // Avisa antes de salir de la página con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  const cambiar = <K extends keyof Campos>(clave: K, valor: Campos[K]) => {
    setCampos((previo) => ({ ...previo, [clave]: valor }));
    setSucio(true);
  };
  const texto =
    (clave: keyof Campos) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      cambiar(clave, e.target.value as never);

  const capturasActuales = (proyecto?.capturas ?? []).filter((c) => !quitarCapturas.includes(c.id));
  const totalCapturas = capturasActuales.length + capturasNuevas.length;

  /** El proyecto tal y como quedaría al guardar: lo usa la vista previa. */
  const comoQuedaria = (): Proyecto => ({
    id: proyecto?.id ?? "vista-previa",
    titulo: campos.titulo.trim() || "Sin título",
    categoria: campos.categoria,
    resumen: campos.resumen.trim(),
    problema: campos.problema.trim(),
    aportacion: campos.aportacion.trim(),
    comoProbar: campos.comoProbar.trim(),
    tecnologias: [
      ...new Set(
        campos.tecnologias
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ],
    fecha: campos.fecha.trim(),
    estadoDesarrollo: campos.estadoDesarrollo,
    publicado: proyecto?.publicado ?? false,
    portada: portadaNueva
      ? archivoLocal("portada-local", portadaNueva, urlPortada, `Portada de ${campos.titulo}`)
      : quitarPortada
        ? null
        : (proyecto?.portada ?? null),
    capturas: [
      ...capturasActuales.map((c) => ({ ...c, alt: altCapturas[c.id] ?? c.alt })),
      ...capturasNuevas.map((f, i) =>
        archivoLocal(`captura-local-${i}`, f, urlsCapturas[i] ?? "", `Captura de ${campos.titulo}`),
      ),
    ],
    descarga: descargaNueva
      ? archivoLocal("descarga-local", descargaNueva, urlDescarga, "")
      : quitarDescarga
        ? null
        : (proyecto?.descarga ?? null),
    enlaces: {
      repositorio: campos.repositorio.trim(),
      demo: campos.demo.trim(),
      descargaExterna: campos.descargaExterna.trim(),
    },
    creadoEn: proyecto?.creadoEn ?? "",
    actualizadoEn: proyecto?.actualizadoEn ?? "",
    publicadoEn: proyecto?.publicadoEn ?? null,
  });

  const formulario = () => {
    const fd = new FormData();
    fd.set("id", proyecto?.id ?? "");
    for (const [clave, valor] of Object.entries(campos)) fd.set(clave, valor);
    if (portadaNueva) fd.set("portada", portadaNueva);
    else if (quitarPortada) fd.set("quitarPortada", "1");
    capturasNuevas.forEach((archivo) => fd.append("capturas", archivo));
    quitarCapturas.forEach((id) => fd.append("quitarCaptura", id));
    for (const [id, alt] of Object.entries(altCapturas)) fd.set(`alt:${id}`, alt);
    if (descargaNueva) fd.set("descarga", descargaNueva);
    else if (quitarDescarga) fd.set("quitarDescarga", "1");
    return fd;
  };

  const terminar = async (guardado: Proyecto, texto: string) => {
    mensajePendiente = { tipo: "ok", texto };
    setSucio(false);
    if (!proyecto) {
      await navigate({ to: "/admin/proyectos/$id", params: { id: guardado.id }, replace: true });
    } else {
      await router.invalidate();
    }
  };

  const fallo = async (resultado: { error: string; sinSesion?: boolean }) => {
    setMensaje({ tipo: "error", texto: resultado.error });
    if (resultado.sinSesion) await router.invalidate();
  };

  const guardar = async (publicar: boolean) => {
    if (campos.titulo.trim().length < 2) {
      setMensaje({ tipo: "error", texto: "El título necesita al menos 2 caracteres." });
      document.getElementById("campo-titulo")?.focus();
      return;
    }
    setOcupado(publicar ? "publicar" : "guardar");
    setMensaje(null);
    try {
      const resultado = await guardarProyectoFn({ data: formulario() });
      if (!resultado.ok) return await fallo(resultado);
      if (!publicar) {
        return await terminar(
          resultado.datos,
          proyecto ? "Cambios guardados." : "Borrador creado. Solo lo ves tú.",
        );
      }
      const publicado = await cambiarPublicacionFn({
        data: { id: resultado.datos.id, publicar: true },
      });
      if (!publicado.ok) {
        mensajePendiente = {
          tipo: "error",
          texto: `Guardado, pero no publicado: ${publicado.error}`,
        };
        setSucio(false);
        if (!proyecto)
          await navigate({
            to: "/admin/proyectos/$id",
            params: { id: resultado.datos.id },
            replace: true,
          });
        else await router.invalidate();
        return;
      }
      await terminar(publicado.datos, "Publicado. Ya aparece en la web.");
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se ha podido contactar con el servidor. Revisa la conexión.",
      });
    } finally {
      setOcupado(null);
    }
  };

  const retirar = async () => {
    if (!proyecto) return;
    setOcupado("retirar");
    const resultado = await cambiarPublicacionFn({ data: { id: proyecto.id, publicar: false } });
    setOcupado(null);
    if (!resultado.ok) return fallo(resultado);
    mensajePendiente = {
      tipo: "ok",
      texto: sucio
        ? "Retirado de la web. Los cambios que no habías guardado se han descartado."
        : "Retirado de la web. Sigue guardado como borrador.",
    };
    setSucio(false);
    await router.invalidate();
  };

  const elegirPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const error = comprobarImagen(archivo);
    if (error) return setMensaje({ tipo: "error", texto: error });
    setPortadaNueva(archivo);
    setQuitarPortada(false);
    setSucio(true);
  };

  const elegirCapturas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = [...(e.target.files ?? [])];
    e.target.value = "";
    const errores = archivos.map(comprobarImagen).filter(Boolean);
    if (errores.length) return setMensaje({ tipo: "error", texto: errores.join(" ") });
    if (totalCapturas + archivos.length > LIMITES.capturas) {
      return setMensaje({
        tipo: "error",
        texto: `Como máximo ${LIMITES.capturas} capturas por proyecto.`,
      });
    }
    setCapturasNuevas((previas) => [...previas, ...archivos]);
    setSucio(true);
  };

  const elegirDescarga = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const error = comprobarDescarga(archivo);
    if (error) return setMensaje({ tipo: "error", texto: error });
    setDescargaNueva(archivo);
    setQuitarDescarga(false);
    setSucio(true);
  };

  const portadaVisible = portadaNueva
    ? urlPortada
    : quitarPortada
      ? ""
      : (proyecto?.portada?.url ?? "");
  const descargaActual = descargaNueva ?? (quitarDescarga ? null : proyecto?.descarga);

  return (
    <div>
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a tus proyectos
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {proyecto?.publicado ? (
          <Insignia tono="exito">Publicado</Insignia>
        ) : (
          <Insignia tono="neutro">Borrador</Insignia>
        )}
        {sucio ? <Insignia tono="aviso">Cambios sin guardar</Insignia> : null}
      </div>
      <h1 className="mt-3 text-3xl font-semibold">
        {proyecto ? "Editar proyecto" : "Nuevo proyecto"}
      </h1>

      <div
        role={mensaje?.tipo === "error" ? "alert" : "status"}
        aria-live="polite"
        className={cn(
          "mt-4 text-sm",
          mensaje?.tipo === "error" ? "text-destructive" : "text-success",
          mensaje ? "rounded-sm border px-3 py-2" : "",
          mensaje?.tipo === "error" ? "border-destructive/40" : "border-success/30",
        )}
      >
        {mensaje?.texto}
      </div>

      <form
        className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
        onSubmit={(e) => {
          e.preventDefault();
          void guardar(false);
        }}
      >
        <div className="space-y-6">
          {/* ---------------------------------------------------- información */}
          <fieldset className="panel space-y-4 p-5">
            <legend className="sr-only">Información</legend>
            <p className="label-mono text-primary" aria-hidden="true">
              Información
            </p>
            <Campo etiqueta="Título" htmlFor="campo-titulo">
              <input
                id="campo-titulo"
                value={campos.titulo}
                onChange={texto("titulo")}
                maxLength={80}
                required
                className={claseCampo()}
                placeholder="Ej.: Plugin de spawn para mi servidor"
              />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Categoría" htmlFor="campo-categoria">
                <select
                  id="campo-categoria"
                  value={campos.categoria}
                  onChange={texto("categoria")}
                  className={claseCampo()}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {NOMBRE_CATEGORIA[c]}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Fecha" htmlFor="campo-fecha" opcional>
                <input
                  id="campo-fecha"
                  value={campos.fecha}
                  onChange={texto("fecha")}
                  maxLength={20}
                  className={claseCampo()}
                  placeholder="2026"
                />
              </Campo>
            </div>
            <fieldset>
              <legend className="label-mono mb-2 block">Estado del desarrollo</legend>
              <div className="flex flex-wrap gap-2">
                {ESTADOS_DESARROLLO.map((estado) => (
                  <label key={estado} className="relative">
                    <input
                      type="radio"
                      name="estadoDesarrollo"
                      value={estado}
                      checked={campos.estadoDesarrollo === estado}
                      onChange={() => cambiar("estadoDesarrollo", estado)}
                      className="peer absolute inset-0 cursor-pointer opacity-0"
                    />
                    <span className="inline-flex min-h-10 items-center rounded-sm border border-border px-3 font-mono text-[11px] tracking-wide text-muted-foreground uppercase transition-colors peer-checked:border-primary peer-checked:bg-primary/12 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                      {NOMBRE_ESTADO[estado]}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Es independiente de publicarlo: puedes enseñar proyectos en desarrollo.
              </p>
            </fieldset>
            <Campo
              etiqueta="Resumen"
              htmlFor="campo-resumen"
              ayuda={`Aparece en la tarjeta. ${campos.resumen.length}/240. Necesario para publicar.`}
            >
              <textarea
                id="campo-resumen"
                rows={2}
                value={campos.resumen}
                onChange={texto("resumen")}
                maxLength={240}
                aria-describedby="campo-resumen-ayuda"
                className={cn(claseCampo(), "resize-y")}
                placeholder="Una frase sobre qué es y para qué sirve."
              />
            </Campo>
          </fieldset>

          {/* --------------------------------------------------------- ficha */}
          <fieldset className="panel space-y-4 p-5">
            <legend className="sr-only">Ficha</legend>
            <p className="label-mono text-primary" aria-hidden="true">
              Ficha
            </p>
            <Campo etiqueta="Qué quería resolver" htmlFor="campo-problema" opcional>
              <textarea
                id="campo-problema"
                rows={4}
                value={campos.problema}
                onChange={texto("problema")}
                maxLength={3000}
                className={cn(claseCampo(), "resize-y")}
              />
            </Campo>
            <Campo etiqueta="Qué hice" htmlFor="campo-aportacion" opcional>
              <textarea
                id="campo-aportacion"
                rows={4}
                value={campos.aportacion}
                onChange={texto("aportacion")}
                maxLength={3000}
                className={cn(claseCampo(), "resize-y")}
              />
            </Campo>
            <Campo etiqueta="Cómo probarlo" htmlFor="campo-probar" opcional>
              <textarea
                id="campo-probar"
                rows={3}
                value={campos.comoProbar}
                onChange={texto("comoProbar")}
                maxLength={3000}
                className={cn(claseCampo(), "resize-y")}
                placeholder="Ej.: descarga el .jar, ponlo en /plugins y escribe /spawn."
              />
            </Campo>
            <Campo
              etiqueta="Tecnologías"
              htmlFor="campo-tecnologias"
              opcional
              ayuda="Separadas por comas. Máximo 12."
            >
              <input
                id="campo-tecnologias"
                value={campos.tecnologias}
                onChange={texto("tecnologias")}
                maxLength={600}
                aria-describedby="campo-tecnologias-ayuda"
                className={claseCampo()}
                placeholder="Java, Paper, MySQL"
              />
            </Campo>
          </fieldset>

          {/* ------------------------------------------------------ imágenes */}
          <fieldset className="panel space-y-5 p-5">
            <legend className="sr-only">Imágenes</legend>
            <p className="label-mono text-primary" aria-hidden="true">
              Imágenes
            </p>
            <div>
              <p className="label-mono mb-2">Portada (16:9)</p>
              <div className="aspect-16/9 w-full max-w-md overflow-hidden rounded-sm border border-border bg-surface-2">
                {portadaVisible ? (
                  <img
                    src={portadaVisible}
                    alt="Portada actual"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="bg-grid flex size-full items-center justify-center text-xs text-muted-foreground">
                    Sin portada
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label htmlFor="campo-portada" className="sr-only">
                  {portadaVisible ? "Cambiar portada" : "Subir portada"}
                </label>
                <input
                  id="campo-portada"
                  type="file"
                  accept={TIPOS_IMAGEN.join(",")}
                  onChange={elegirPortada}
                  className={claseArchivo}
                />
                {portadaNueva ? (
                  <button
                    type="button"
                    onClick={() => setPortadaNueva(null)}
                    className={`${claseBotonContorno} py-2`}
                  >
                    <Undo2 className="size-4" aria-hidden="true" /> Deshacer
                  </button>
                ) : proyecto?.portada && !quitarPortada ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuitarPortada(true);
                      setSucio(true);
                    }}
                    className={`${claseBotonContorno} py-2`}
                  >
                    <X className="size-4" aria-hidden="true" /> Quitar portada
                  </button>
                ) : quitarPortada ? (
                  <button
                    type="button"
                    onClick={() => setQuitarPortada(false)}
                    className={`${claseBotonContorno} py-2`}
                  >
                    <Undo2 className="size-4" aria-hidden="true" /> Recuperar portada
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                PNG, JPG, WebP o GIF. Máximo {formatearTamano(LIMITES.imagenBytes)}.
              </p>
            </div>

            <div>
              <p className="label-mono mb-2">
                Capturas ({totalCapturas}/{LIMITES.capturas})
              </p>
              {totalCapturas > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {capturasActuales.map((captura) => (
                    <li
                      key={captura.id}
                      className="rounded-sm border border-border bg-surface-2 p-2"
                    >
                      <img
                        src={captura.url}
                        alt=""
                        className="aspect-16/9 w-full rounded-sm object-cover"
                      />
                      <label htmlFor={`alt-${captura.id}`} className="label-mono mt-2 block">
                        Descripción
                      </label>
                      <input
                        id={`alt-${captura.id}`}
                        value={altCapturas[captura.id] ?? captura.alt}
                        onChange={(e) => {
                          setAltCapturas((p) => ({ ...p, [captura.id]: e.target.value }));
                          setSucio(true);
                        }}
                        maxLength={200}
                        className={cn(claseCampo(), "mt-1 py-2")}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQuitarCapturas((p) => [...p, captura.id]);
                          setSucio(true);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" aria-hidden="true" /> Quitar captura
                      </button>
                    </li>
                  ))}
                  {capturasNuevas.map((archivo, i) => (
                    <li
                      key={`${archivo.name}-${i}`}
                      className="rounded-sm border border-dashed border-border-strong bg-surface-2 p-2"
                    >
                      <img
                        src={urlsCapturas[i]}
                        alt=""
                        className="aspect-16/9 w-full rounded-sm object-cover"
                      />
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        Nueva · {archivo.name} · {formatearTamano(archivo.size)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCapturasNuevas((p) => p.filter((_, j) => j !== i))}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" aria-hidden="true" /> No subir
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {quitarCapturas.length ? (
                <button
                  type="button"
                  onClick={() => setQuitarCapturas([])}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Undo2 className="size-3.5" aria-hidden="true" /> Recuperar{" "}
                  {quitarCapturas.length} captura(s) quitada(s)
                </button>
              ) : null}
              {totalCapturas < LIMITES.capturas ? (
                <div className="mt-3">
                  <label
                    htmlFor="campo-capturas"
                    className="label-mono mb-2 flex items-center gap-1.5"
                  >
                    <ImagePlus className="size-3.5" aria-hidden="true" /> Añadir capturas
                  </label>
                  <input
                    id="campo-capturas"
                    type="file"
                    multiple
                    accept={TIPOS_IMAGEN.join(",")}
                    onChange={elegirCapturas}
                    className={claseArchivo}
                  />
                </div>
              ) : null}
            </div>
          </fieldset>

          {/* --------------------------------------------- descarga y enlaces */}
          <fieldset className="panel space-y-4 p-5">
            <legend className="sr-only">Descarga y enlaces</legend>
            <p className="label-mono text-primary" aria-hidden="true">
              Descarga y enlaces
            </p>
            <div>
              <label htmlFor="campo-descarga" className="label-mono mb-2 block">
                Archivo descargable <span className="normal-case">(opcional)</span>
              </label>
              {descargaActual ? (
                <p className="mb-2 font-mono text-xs text-foreground">
                  {descargaNueva ? "Nuevo · " : ""}
                  {"nombre" in descargaActual ? descargaActual.nombre : descargaActual.name} ·{" "}
                  {formatearTamano(
                    "tamano" in descargaActual ? descargaActual.tamano : descargaActual.size,
                  )}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="campo-descarga"
                  type="file"
                  accept={EXTENSIONES_DESCARGA.join(",")}
                  onChange={elegirDescarga}
                  aria-describedby="campo-descarga-ayuda"
                  className={claseArchivo}
                />
                {descargaNueva ? (
                  <button
                    type="button"
                    onClick={() => setDescargaNueva(null)}
                    className={`${claseBotonContorno} py-2`}
                  >
                    <Undo2 className="size-4" aria-hidden="true" /> Deshacer
                  </button>
                ) : proyecto?.descarga && !quitarDescarga ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuitarDescarga(true);
                      setSucio(true);
                    }}
                    className={`${claseBotonContorno} py-2`}
                  >
                    <X className="size-4" aria-hidden="true" /> Quitar archivo
                  </button>
                ) : quitarDescarga ? (
                  <button
                    type="button"
                    onClick={() => setQuitarDescarga(false)}
                    className={`${claseBotonContorno} py-2`}
                  >
                    <Undo2 className="size-4" aria-hidden="true" /> Recuperar archivo
                  </button>
                ) : null}
              </div>
              <p id="campo-descarga-ayuda" className="mt-1.5 text-xs text-muted-foreground">
                {EXTENSIONES_DESCARGA.join(", ")}. Máximo {formatearTamano(LIMITES.descargaBytes)}.
                Mientras sea borrador, solo tú puedes descargarlo.
              </p>
            </div>
            <Campo etiqueta="Repositorio" htmlFor="campo-repositorio" opcional>
              <input
                id="campo-repositorio"
                type="url"
                inputMode="url"
                value={campos.repositorio}
                onChange={texto("repositorio")}
                className={claseCampo()}
                placeholder="https://github.com/…"
              />
            </Campo>
            <Campo etiqueta="Demo" htmlFor="campo-demo" opcional>
              <input
                id="campo-demo"
                type="url"
                inputMode="url"
                value={campos.demo}
                onChange={texto("demo")}
                className={claseCampo()}
                placeholder="https://…"
              />
            </Campo>
            <Campo
              etiqueta="Descarga externa"
              htmlFor="campo-descarga-externa"
              opcional
              ayuda="Por ejemplo, la página del plugin en Modrinth o SpigotMC."
            >
              <input
                id="campo-descarga-externa"
                type="url"
                inputMode="url"
                value={campos.descargaExterna}
                onChange={texto("descargaExterna")}
                aria-describedby="campo-descarga-externa-ayuda"
                className={claseCampo()}
                placeholder="https://…"
              />
            </Campo>
          </fieldset>
        </div>

        {/* ----------------------------------------------------- acciones */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="panel space-y-3 p-5">
            <p className="label-mono">Publicación</p>
            <p className="text-sm text-muted-foreground">
              {proyecto?.publicado
                ? "Visible en la web. Al guardar, los cambios se publican al momento."
                : "Borrador: solo lo ves tú desde este panel."}
            </p>
            <button
              type="submit"
              disabled={ocupado !== null}
              className={cn(
                proyecto?.publicado ? claseBotonPrimario : claseBotonContorno,
                "w-full",
              )}
            >
              <Save className="size-4" aria-hidden="true" />
              {ocupado === "guardar"
                ? "Guardando…"
                : proyecto
                  ? "Guardar cambios"
                  : "Guardar borrador"}
            </button>
            {!proyecto?.publicado ? (
              <button
                type="button"
                disabled={ocupado !== null}
                onClick={() => guardar(true)}
                className={cn(claseBotonPrimario, "w-full")}
              >
                <Send className="size-4" aria-hidden="true" />
                {ocupado === "publicar" ? "Publicando…" : "Guardar y publicar"}
              </button>
            ) : (
              <button
                type="button"
                disabled={ocupado !== null}
                onClick={retirar}
                className={cn(claseBotonContorno, "w-full")}
              >
                <EyeOff className="size-4" aria-hidden="true" />
                {ocupado === "retirar" ? "Retirando…" : "Retirar de la web"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setVista(comoQuedaria())}
              className={cn(claseBotonContorno, "w-full")}
            >
              <Eye className="size-4" aria-hidden="true" />
              Vista previa de la ficha
            </button>
            {proyecto ? (
              <EliminarProyecto
                id={proyecto.id}
                titulo={proyecto.titulo}
                className="w-full"
                onEliminado={async () => {
                  setSucio(false);
                  await navigate({ to: "/admin", replace: true });
                }}
              />
            ) : null}
          </div>

          <div>
            <p className="label-mono mb-2">Tarjeta en la web</p>
            <ul aria-label="Vista previa de la tarjeta">
              <ProjectCard proyecto={comoQuedaria()} onOpen={() => setVista(comoQuedaria())} />
            </ul>
          </div>
        </aside>
      </form>

      <ProjectModal proyecto={vista} onClose={() => setVista(null)} vistaPrevia />
    </div>
  );
}
