"use client";

import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { UNITS } from "@/entities/catalog";

export const SORTS = [
  "relevance",
  "price_asc",
  "price_desc",
  "newest",
] as const;

export const catalogParsers = {
  q: parseAsString.withDefault(""),
  // Ключевые слова от ИИ-поиска храним отдельно, чтобы не подставлять основы слов в поле поиска
  kw: parseAsString,
  category: parseAsString,
  city: parseAsString,
  region: parseAsString,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  quantity: parseAsFloat,
  unit: parseAsStringLiteral(UNITS),
  delivery: parseAsBoolean.withDefault(false),
  sort: parseAsStringLiteral(SORTS).withDefault("relevance"),
  page: parseAsInteger.withDefault(1),
  ai: parseAsString,
};

/** Все фильтры каталога живут в URL: ссылкой можно поделиться, «Назад» работает. */
export function useCatalogFilters() {
  return useQueryStates(catalogParsers, { history: "replace", scroll: false });
}

export type CatalogFilterValues = {
  q: string;
  kw: string | null;
  category: string | null;
  city: string | null;
  region: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  quantity: number | null;
  unit: (typeof UNITS)[number] | null;
  delivery: boolean;
  sort: (typeof SORTS)[number];
  page: number;
};
