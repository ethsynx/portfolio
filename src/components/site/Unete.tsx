import { Bot, Network, Plug } from "lucide-react";

import { CopiarDiscord } from "@/components/site/CopiarDiscord";
import { PixelMark, Reveal, Section, SectionHeading, Tag } from "@/components/site/primitives";
import { siteConfig } from "@/config/site";

const ICONOS = { plugin: Plug, bot: Bot, network: Network } as const;

/** Sección «Únete»: buscamos más developers. Textos en src/config/site.ts → recruiting. */
export function Unete() {
  const { recruiting } = siteConfig;
  return (
    <Section id="unete" grid>
      <SectionHeading
        eyebrow="Únete"
        title={recruiting.title}
        description={recruiting.description}
      />

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {recruiting.roles.map((rol, index) => {
          const Icono = ICONOS[rol.icon];
          return (
            <Reveal
              as="li"
              key={rol.title}
              delay={index * 60}
              className="panel flex flex-col p-5 transition-colors duration-300 hover:border-border-strong"
            >
              <span className="flex size-10 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
                <Icono className="size-4 text-primary" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{rol.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {rol.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {rol.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Reveal>
          );
        })}
      </ul>

      <Reveal delay={200} className="mt-4">
        <div className="panel flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <PixelMark className="mt-1.5 shrink-0" />
            <div>
              <h3 className="text-base font-semibold">¿Te interesa?</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {recruiting.howTo}
              </p>
            </div>
          </div>
          <CopiarDiscord variante="primario" className="shrink-0" />
        </div>
      </Reveal>
    </Section>
  );
}
