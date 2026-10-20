import { Skeleton } from "@/shared/components/ui/skeleton";

export function LoadingBlock({
  rows = 3,
  label,
}: {
  rows?: number;
  label: string;
}) {
  return (
    <output aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: статичные заглушки
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </output>
  );
}
