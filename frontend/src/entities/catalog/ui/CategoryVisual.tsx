import { cn } from "@/shared/lib/utils";

import { CategoryIcon } from "./CategoryIcon";

const TINTS: Record<string, string> = {
  carrot: "bg-orange-50 text-orange-800",
  apple: "bg-red-50 text-red-800",
  beef: "bg-rose-50 text-rose-900",
  milk: "bg-sky-50 text-sky-900",
  wheat: "bg-amber-50 text-amber-900",
  honey: "bg-yellow-50 text-yellow-900",
  egg: "bg-stone-100 text-stone-800",
  package: "bg-zinc-100 text-zinc-800",
};

type CategoryVisualProps = {
  icon: string;
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

/** Фото товара или безопасная заглушка: иконка категории на тонированном фоне. */
export function CategoryVisual({
  icon,
  imageUrl,
  alt,
  className,
}: CategoryVisualProps) {
  if (imageUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: внешние URL фото от поставщика, без настройки доменов next/image
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "field-pattern flex h-full w-full items-center justify-center",
        TINTS[icon] ?? TINTS.package,
        className,
      )}
    >
      <CategoryIcon icon={icon} className="size-12" strokeWidth={1.5} />
    </div>
  );
}
