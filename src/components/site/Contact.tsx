import { MessageSquare } from "lucide-react";

import { CopiarDiscord } from "@/components/site/CopiarDiscord";
import { PixelMark, Reveal, Section } from "@/components/site/primitives";
import { siteConfig } from "@/config/site";

export function Contact() {
  return (
    <Section id="contacto">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-primary" aria-hidden="true" />
            <span className="label-mono text-primary">Contacto</span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{siteConfig.contact.heading}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {siteConfig.contact.text}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="label-mono">Discord</span>
              <PixelMark />
            </div>
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
                <MessageSquare className="size-4 text-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Mi usuario es</p>
                <p
                  className="mt-1 font-mono text-2xl font-medium text-foreground select-all"
                  id="discord-contacto"
                >
                  {siteConfig.contact.discord}
                </p>
                <CopiarDiscord
                  variante="primario"
                  mostrarUsuario={false}
                  idObjetivo="discord-contacto"
                  className="mt-5"
                />
              </div>
            </div>
            <p className="border-t border-border bg-surface-2 px-4 py-3 font-mono text-[11px] text-muted-foreground">
              # añádeme o búscame por mi usuario y escríbeme por mensaje directo
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
