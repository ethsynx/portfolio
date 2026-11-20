import { ArrowRight } from "lucide-react";

import { CopiarDiscord } from "@/components/site/CopiarDiscord";
import { Logo } from "@/components/site/Logo";
import { PixelMark, Reveal } from "@/components/site/primitives";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(120%_80%_at_50%_0%,black,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10 lg:px-8">
        <div>
          <Reveal className="mb-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface-2 sm:size-16"
            >
              <Logo className="h-6 sm:h-7" />
            </span>
            <span>
              <span className="block font-display text-base font-semibold sm:text-lg">
                {siteConfig.name}
              </span>
              <span className="label-mono">Plugins · Bots · Networks</span>
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
              {siteConfig.headline.lead}
              <span className="block text-primary">{siteConfig.headline.accent}</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </Reveal>

          <Reveal delay={180} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#proyectos"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Ver proyectos
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <CopiarDiscord mostrarUsuario={false} idObjetivo="discord-portada" />
          </Reveal>

          <Reveal
            delay={240}
            className="mt-8 flex items-center gap-3 text-xs text-muted-foreground"
          >
            <PixelMark />
            <span className="font-mono">
              Discord:{" "}
              <span
                id="discord-portada"
                className="rounded-sm border border-border bg-surface-2 px-1.5 py-0.5 text-foreground select-all"
              >
                {siteConfig.contact.discord}
              </span>
              <span className="ml-2">· {siteConfig.country}</span>
            </span>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="label-mono font-normal">Perfil</h2>
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-2 rounded-full bg-border-strong" />
                <span className="size-2 rounded-full bg-border-strong" />
                <span className="size-2 rounded-full bg-primary/70" />
              </span>
            </div>
            <dl className="grid grid-cols-2">
              <div className="border-r border-b border-border px-4 py-5 sm:px-5 sm:py-6">
                <dt className="label-mono">Nombre</dt>
                <dd className="mt-2 font-display text-xl font-semibold sm:text-2xl">
                  {siteConfig.name}
                </dd>
              </div>
              <div className="border-b border-border px-4 py-5 sm:px-5 sm:py-6">
                <dt className="label-mono">Contacto</dt>
                <dd className="mt-2 font-display text-xl font-semibold sm:text-2xl">
                  Discord
                  <span className="mt-1 block font-mono text-xs font-normal text-muted-foreground select-all">
                    {siteConfig.contact.discord}
                  </span>
                </dd>
              </div>
              <div className="col-span-2 px-4 py-5 sm:px-5 sm:py-6">
                <dt className="label-mono">Especialidades</dt>
                <dd className="mt-3">
                  <ul className="space-y-2">
                    {siteConfig.specialties.map((especialidad) => (
                      <li
                        key={especialidad}
                        className="flex items-center gap-3 font-display text-lg font-semibold"
                      >
                        <span className="size-1.5 shrink-0 bg-primary" aria-hidden="true" />
                        {especialidad}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <p className="border-t border-border bg-surface-2 px-4 py-3 font-mono text-[11px] text-muted-foreground">
              # perfil · {siteConfig.country}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
