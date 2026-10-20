/**
 * Официальные показатели области Абай. Внесены вручную из публикаций
 * Бюро национальной статистики АСПиР РК, с периодом и датой публикации.
 * Мы не пересчитываем и не прогнозируем эти значения.
 */
export type Localized = { ru: string; kk: string };

export type RegionFact = {
  key: "population" | "rural" | "agri" | "sme" | "retail" | "wholesale" | "grp";
  value: number;
  unit: "thousandPeople" | "percent" | "mlnTenge" | "units";
  /** Дополнение к значению, например «104,5% к прошлому году». */
  note?: Localized;
  period: Localized;
  sourceId: keyof typeof SOURCES;
};

export const ACCESSED_AT = "2026-10-20";

export const SOURCES = {
  region: {
    name: {
      ru: "Бюро национальной статистики АСПиР РК — «Область Абай. Статистика регионов»",
      kk: "ҚР СЖРА Ұлттық статистика бюросы — «Абай облысы. Өңірлер статистикасы»",
    },
    url: "https://stat.gov.kz/ru/region/abay/",
    published: {
      ru: "обновляется ежемесячно (таблицы от 15–20.10.2026)",
      kk: "ай сайын жаңартылады (15–20.10.2026 кестелері)",
    },
  },
  sme: {
    name: {
      ru: "Бюро национальной статистики — «Мониторинг малого и среднего предпринимательства в РК (на 1 апреля 2025 г.)»",
      kk: "Ұлттық статистика бюросы — «ҚР шағын және орта кәсіпкерлік мониторингі (2025 жылғы 1 сәуір)»",
    },
    url: "https://stat.gov.kz/ru/industries/business-statistics/stat-org/publications/347146/",
    published: { ru: "15.07.2025", kk: "15.07.2025" },
  },
  grp: {
    name: {
      ru: "Бюро национальной статистики — «Валовой региональный продукт РК (январь–декабрь 2024 г.)»",
      kk: "Ұлттық статистика бюросы — «ҚР жалпы өңірлік өнімі (2024 жылғы қаңтар–желтоқсан)»",
    },
    url: "https://stat.gov.kz/ru/industries/economy/national-accounts/publications/367840/",
    published: {
      ru: "29.04.2025 (предварительные данные)",
      kk: "29.04.2025 (алдын ала деректер)",
    },
  },
} as const;

export const REGION_FACTS: RegionFact[] = [
  {
    key: "population",
    value: 590.7,
    unit: "thousandPeople",
    period: { ru: "на 1 сентября 2026 г.", kk: "2026 жылғы 1 қыркүйек" },
    sourceId: "region",
  },
  {
    key: "rural",
    value: 36.7,
    unit: "percent",
    note: {
      ru: "216,9 тыс. сельских жителей, 373,8 тыс. городских",
      kk: "216,9 мың ауыл тұрғыны, 373,8 мың қала тұрғыны",
    },
    period: { ru: "на 1 сентября 2026 г.", kk: "2026 жылғы 1 қыркүйек" },
    sourceId: "region",
  },
  {
    key: "agri",
    value: 405_688,
    unit: "mlnTenge",
    note: {
      ru: "104,5% к соответствующему периоду прошлого года",
      kk: "өткен жылдың сәйкес кезеңіне 104,5%",
    },
    period: { ru: "январь–сентябрь 2026 г.", kk: "2026 жылғы қаңтар–қыркүйек" },
    sourceId: "region",
  },
  {
    key: "sme",
    value: 54_861,
    unit: "units",
    note: { ru: "годом ранее — 53 262", kk: "бір жыл бұрын — 53 262" },
    period: { ru: "на 1 апреля 2025 г.", kk: "2025 жылғы 1 сәуір" },
    sourceId: "sme",
  },
  {
    key: "retail",
    value: 524_810.7,
    unit: "mlnTenge",
    period: { ru: "январь–сентябрь 2026 г.", kk: "2026 жылғы қаңтар–қыркүйек" },
    sourceId: "region",
  },
  {
    key: "wholesale",
    value: 328_537,
    unit: "mlnTenge",
    period: { ru: "январь–сентябрь 2026 г.", kk: "2026 жылғы қаңтар–қыркүйек" },
    sourceId: "region",
  },
  {
    key: "grp",
    value: 3_189_590.4,
    unit: "mlnTenge",
    note: {
      ru: "2,4% ВВП Казахстана, индекс физического объёма 104,3%",
      kk: "Қазақстан ЖІӨ-нің 2,4%-ы, нақты көлем индексі 104,3%",
    },
    period: { ru: "2024 г.", kk: "2024 ж." },
    sourceId: "grp",
  },
];

/** Доли населения для диаграммы: тот же источник и период, что у показателя «rural». */
export const POPULATION_SPLIT = {
  urban: 63.3,
  rural: 36.7,
  urbanThousand: 373.8,
  ruralThousand: 216.9,
};

export const DATASET_DIRECTORY = [
  {
    name: {
      ru: "Статистика регионов: область Абай",
      kk: "Өңірлер статистикасы: Абай облысы",
    },
    url: "https://stat.gov.kz/ru/region/abay/",
    status: "manual",
  },
  {
    name: {
      ru: "Мониторинг МСП по регионам",
      kk: "Өңірлер бойынша ШОБ мониторингі",
    },
    url: "https://stat.gov.kz/ru/industries/business-statistics/stat-org/publications/347146/",
    status: "manual",
  },
  {
    name: { ru: "ВРП по регионам", kk: "Өңірлер бойынша ЖӨӨ" },
    url: "https://stat.gov.kz/ru/industries/economy/national-accounts/publications/367840/",
    status: "manual",
  },
  {
    name: {
      ru: "Портал открытых данных data.egov.kz (наборы по сельскому хозяйству и предпринимательству)",
      kk: "data.egov.kz ашық деректер порталы (ауыл шаруашылығы мен кәсіпкерлік жиынтықтары)",
    },
    url: "https://data.egov.kz/",
    status: "planned",
  },
] as const;
