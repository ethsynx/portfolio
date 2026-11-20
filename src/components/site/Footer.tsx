import { MessageSquare } from "lucide-react";

import { Logo } from "@/components/site/Logo";
import { PixelMark } from "@/components/site/primitives";
import { navLinks, siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
              <Logo className="h-3.5" />
            </span>
            <span className="font-display text-sm font-semibold">{siteConfig.studio}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {siteConfig.footer.description}
          </p>
        </div>

        <nav aria-label="Pie de página">
          <p className="label-mono">Navegación</p>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label-mono">Contacto</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="size-4" aria-hidden="true" /> Discord:{" "}
            <span className="font-mono text-foreground select-all">
              {siteConfig.contact.discord}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.studio}
          </p>
          <p className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <PixelMark />
            Las demos de la consola son simulaciones.
          </p>
        </div>
      </div>
    </footer>
  );
}
