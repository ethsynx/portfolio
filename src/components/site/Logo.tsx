import { cn } from "@/lib/utils";

/** Logotipo de NexStudios (la «N» roja). Decorativo: el nombre va siempre en texto al lado. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="229 289 784 673"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-auto shrink-0", className)}
    >
      <path fill="#FB2703" d="M229 289H450L780 690V289H933L1013 373V962H757L448 585V962H229Z" />
    </svg>
  );
}
