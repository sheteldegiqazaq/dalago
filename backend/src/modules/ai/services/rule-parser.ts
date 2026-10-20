import type { Unit } from '@generated/prisma/client';
import type { ListingDraft, SearchIntent } from '../ports/ai-assistant';
import {
  CITY_LEXICON,
  type LexiconEntry,
  PRODUCT_LEXICON,
  REGION_STEMS,
  UNIT_PATTERNS,
} from './lexicon';

// \b в JS не работает с кириллицей, поэтому границы слов задаём через \p{L}.
const NOT_LETTER_AFTER = '(?![\\p{L}])';
const NUMBER = '(\\d+(?:[.,]\\d+)?)';
const CURRENCY = '(?:тенге|теңге|тг|₸|kzt|tenge)';
const UNIT_ALTERNATION = UNIT_PATTERNS.map((u) => u.pattern).join('|');
// Число, за которым идёт единица измерения, — это объём («до 200 кг»), а не цена.
const NOT_QUANTITY = `(?![\\d.,])(?!\\s*(?:${UNIT_ALTERNATION})${NOT_LETTER_AFTER})`;

const toNumber = (raw: string) => Number(raw.replace(',', '.'));

export function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

export function findProducts(text: string): LexiconEntry[] {
  const words = normalize(text).split(/[^\p{L}]+/u);

  return PRODUCT_LEXICON.filter((entry) =>
    entry.stems.some((stem) => {
      const normalizedStem = normalize(stem);

      // Короткие основы («лук», «бал», «ұн», «сыр») — только целым словом.
      if (normalizedStem.length <= 3) {
        return words.includes(normalizedStem);
      }

      return normalizedStem.includes(' ')
        ? normalize(text).includes(normalizedStem)
        : words.some((word) => word.startsWith(normalizedStem));
    }),
  );
}

export function findCity(text: string): string | null {
  const normalized = normalize(text);
  const match = CITY_LEXICON.find((city) =>
    city.stems.some((stem) => normalized.includes(normalize(stem))),
  );

  return match?.id ?? null;
}

export function findRegion(text: string): string | null {
  const normalized = normalize(text);
  const match = REGION_STEMS.find((region) =>
    region.stems.some((stem) => normalized.includes(stem)),
  );

  return match?.id ?? null;
}

export function findQuantity(
  text: string,
): { value: number; unit: Unit } | null {
  const normalized = normalize(text);

  for (const { unit, pattern } of UNIT_PATTERNS) {
    const regex = new RegExp(
      `${NUMBER}\\s*(?:${pattern})${NOT_LETTER_AFTER}`,
      'u',
    );
    const match = regex.exec(normalized);

    if (match) {
      return { value: toNumber(match[1]), unit };
    }
  }

  return null;
}

/** «до 150 тенге», «дешевле 150 тг», «150 теңгеге дейін», «under 150 tenge». */
export function findMaxPrice(text: string): number | null {
  const normalized = normalize(text);
  const patterns = [
    new RegExp(
      `(?:до|не дороже|дешевле|не более|максимум|under|below|up to)\\s*${NUMBER}${NOT_QUANTITY}\\s*${CURRENCY}?`,
      'u',
    ),
    new RegExp(`${NUMBER}\\s*${CURRENCY}\\p{L}*\\s*(?:дейін|арзан)`, 'u'),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(normalized);

    if (match) {
      return toNumber(match[1]);
    }
  }

  return null;
}

/** «150 тг за кило», «по 150 тенге», «цена 150», «бағасы 150», «150 теңгеден». */
export function findUnitPrice(text: string): number | null {
  const normalized = normalize(text);
  const patterns = [
    new RegExp(`${NUMBER}\\s*${CURRENCY}`, 'u'),
    new RegExp(`(?:цена|по цене|бағасы|баға|price)\\s*[:-]?\\s*${NUMBER}`, 'u'),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(normalized);

    if (match) {
      return toNumber(match[1]);
    }
  }

  return null;
}

export function mentionsDelivery(text: string): boolean {
  return /доставк|достав|привез|жеткіз|жеткіза|delivery|deliver/u.test(
    normalize(text),
  );
}

export function mentionsPickup(text: string): boolean {
  return /самовывоз|өзі алып|pickup|pick up/u.test(normalize(text));
}

const WEEKDAYS: Array<{ day: number; stems: string[] }> = [
  { day: 1, stems: ['понедельник', 'дүйсенбі', 'monday'] },
  { day: 2, stems: ['вторник', 'сейсенбі', 'tuesday'] },
  { day: 3, stems: ['сред', 'сәрсенбі', 'wednesday'] },
  { day: 4, stems: ['четверг', 'бейсенбі', 'thursday'] },
  { day: 5, stems: ['пятниц', 'жұма', 'friday'] },
  { day: 6, stems: ['суббот', 'сенбі', 'saturday'] },
  { day: 0, stems: ['воскресен', 'жексенбі', 'sunday'] },
];

/** «до пятницы», «завтра», «ертең» → ближайшая дата (YYYY-MM-DD). */
export function findDeadline(text: string, today: Date): string | null {
  const normalized = normalize(text);
  const base = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (/завтра|ертең|tomorrow/u.test(normalized)) {
    base.setUTCDate(base.getUTCDate() + 1);
    return base.toISOString().slice(0, 10);
  }

  const weekday = WEEKDAYS.find((entry) =>
    entry.stems.some((stem) => normalized.includes(stem)),
  );

  if (!weekday) {
    return null;
  }

  const diff = (weekday.day - base.getUTCDay() + 7) % 7 || 7;
  base.setUTCDate(base.getUTCDate() + diff);

  return base.toISOString().slice(0, 10);
}

export function parseSearchQuery(
  text: string,
  today = new Date(),
): SearchIntent {
  const products = findProducts(text);
  const specific = products.filter(
    (p) => p.nameRu !== 'Мясо' && p.nameRu !== 'Зерно',
  );
  const chosen = specific.length > 0 ? specific : products;
  const categories = [...new Set(chosen.map((p) => p.category))];
  const quantity = findQuantity(text);
  const cityId = findCity(text);
  const deliveryRequired = mentionsDelivery(text);

  return {
    keywords: chosen.flatMap((p) =>
      p.stems.filter((s) => s.length > 3 && !/[a-z]/.test(s)),
    ),
    categorySlug: categories.length === 1 ? categories[0] : null,
    // «с доставкой в Семей» — город доставки, а не поставщика: ищем по всему региону.
    cityId: deliveryRequired ? null : cityId,
    regionId: deliveryRequired && cityId ? 'abai' : findRegion(text),
    minPrice: null,
    maxPrice: findMaxPrice(text),
    quantity: quantity?.value ?? null,
    unit: quantity?.unit ?? null,
    deliveryRequired,
    neededBy: findDeadline(text, today),
  };
}

export function parseListingText(text: string): ListingDraft {
  const products = findProducts(text);
  const product =
    products.find((p) => p.nameRu !== 'Мясо' && p.nameRu !== 'Зерно') ??
    products[0];
  const quantity = findQuantity(text);
  const cityId = findCity(text);
  const delivery = mentionsDelivery(text);
  const pickup = mentionsPickup(text);
  const cleaned = text.trim().replace(/\s+/g, ' ');

  return {
    title:
      product?.nameRu ?? capitalize(cleaned.split(/[,.!?]/)[0].slice(0, 80)),
    titleKk: product?.nameKk ?? null,
    // Описание — это слова самого поставщика, без добавленных фактов.
    description: capitalize(cleaned),
    descriptionKk: null,
    categorySlug: product?.category ?? null,
    quantity: quantity?.value ?? null,
    unit: quantity?.unit ?? null,
    price: findUnitPrice(text),
    cityId,
    deliveryAvailable: delivery ? true : null,
    pickupAvailable: pickup ? true : null,
    tags: product
      ? product.stems
          .filter((s) => s.length > 3 && !/[a-z]/.test(s))
          .slice(0, 4)
      : [],
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
