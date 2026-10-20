import {
  Apple,
  Beef,
  Carrot,
  Egg,
  Hexagon,
  type LucideProps,
  Milk,
  Package,
  Wheat,
} from "lucide-react";

const ICONS = {
  carrot: Carrot,
  apple: Apple,
  beef: Beef,
  milk: Milk,
  wheat: Wheat,
  honey: Hexagon,
  egg: Egg,
  package: Package,
} as const;

export function CategoryIcon({
  icon,
  ...props
}: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as keyof typeof ICONS] ?? Package;

  return <Icon aria-hidden {...props} />;
}
