export const UNITS = ["KG", "T", "L", "PCS", "PACK"] as const;
export type Unit = (typeof UNITS)[number];

export const SUPPLIER_COMPANY_TYPES = [
  "FARM",
  "PRODUCER",
  "PROCESSOR",
  "WHOLESALE",
] as const;
export const BUYER_COMPANY_TYPES = [
  "SHOP",
  "CAFE",
  "RESTAURANT",
  "CANTEEN",
  "WHOLESALE",
] as const;
