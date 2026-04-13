/** Skus aligned with `ladies-fashion-bot-system-prompt` Internal catalog. */
export const LADIES_FASHION_CATALOG_SKUS = [
  "SS-K01",
  "SS-K02",
  "SS-S01",
  "SS-S02",
  "SS-D01",
  "SS-D02",
] as const;

export type LadiesFashionCatalogSku = (typeof LADIES_FASHION_CATALOG_SKUS)[number];
