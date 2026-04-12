/** Skus aligned with `ladies-fashion-bot-system-prompt` Internal catalog. */
export const LADIES_FASHION_CATALOG_SKUS = [
  "KURTA-01",
  "KURTA-02",
  "DRESS-01",
  "DRESS-02",
  "SAREE-01",
  "SAREE-02",
  "LEH-01",
  "COORD-01",
  "DOLL-01",
  "DUP-01",
] as const;

export type LadiesFashionCatalogSku = (typeof LADIES_FASHION_CATALOG_SKUS)[number];
