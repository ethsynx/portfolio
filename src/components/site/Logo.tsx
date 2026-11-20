import { cn } from "@/lib/utils";

/** Logotipo de Diego (la «D» roja). Decorativo: el nombre va siempre en texto al lado. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="229 289 784 673"
      aria-hidden="true"
      focusable="false"
      className={cn("h-5 w-auto shrink-0", className)}
    >
      <path
        fill="#FB2703"
        fillRule="evenodd"
        d="M229 289H850L1013 452V799L850 962H229ZM448 470V781H760L832 709V542L760 470Z"
      />
    </svg>
  );
}
