import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Fades a block in once it scrolls into view. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-visible={visible || undefined}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <div className={cn("flex items-center gap-2", align === "center" && "justify-center")}>
        <span className="h-px w-6 bg-primary" aria-hidden="true" />
        <span className="label-mono text-primary">{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

export function Section({
  id,
  children,
  className,
  grid = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  grid?: boolean;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-24 py-20 sm:py-24", className)}>
      {grid ? (
        <div
          aria-hidden="true"
          className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
      ) : null}
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

/** Small pixel-block decoration — a restrained nod to Minecraft. */
export function PixelMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("grid grid-cols-3 gap-[2px]", className)}>
      {[0.9, 0.35, 0.6, 0.25, 0.75, 0.2, 0.55, 0.3, 0.85].map((opacity, index) => (
        <span key={index} className="size-[3px] bg-primary" style={{ opacity }} />
      ))}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
