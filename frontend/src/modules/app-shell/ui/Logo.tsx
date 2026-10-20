import { Link } from "@/shared/configs/i18/navigation";

export function Logo({ label }: { label: string }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-md"
      aria-label={label}
    >
      <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden>
        <title>DalaGo</title>
        <rect width="32" height="32" rx="8" fill="var(--primary)" />
        <path
          d="M5 22c6-3 16-3 22 0"
          stroke="var(--wheat)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M5 17c6-3 16-3 22 0"
          stroke="var(--wheat)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity=".7"
        />
        <path
          d="M16 6v9M16 9l-3-2M16 9l3-2M16 12l-3-2M16 12l3-2"
          stroke="var(--primary-foreground)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight text-forest-deep">
        Dala<span className="text-primary">Go</span>
      </span>
    </Link>
  );
}
