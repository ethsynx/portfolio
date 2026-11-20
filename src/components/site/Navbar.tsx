import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/site/Logo";
import { PixelMark } from "@/components/site/primitives";
import { navLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8"
      >
        <a
          href="#inicio"
          aria-label={`${siteConfig.name}, ir al inicio`}
          className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-sm border border-border-strong bg-surface-2">
            <Logo className="h-3.5" />
          </span>
          <span>{siteConfig.name}</span>
        </a>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contacto"
          className="ml-auto hidden items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover lg:ml-4 lg:inline-flex"
        >
          <PixelMark className="opacity-90 [&>span]:bg-primary-foreground" />
          Escríbeme
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="ml-auto inline-flex size-10 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-surface-2 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-border bg-background lg:hidden"
      >
        <ul className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          {navLinks.map((link, index) => (
            <li key={link.href} style={{ transitionDelay: `${index * 30}ms` }}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-border/60 py-3 text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              Escríbeme
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
