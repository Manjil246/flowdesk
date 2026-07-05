export const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

export type NepalProvince = (typeof NEPAL_PROVINCES)[number];

/** Geocoder labels (Nepali/English) → checkout province value. */
export const NEPAL_PROVINCE_LABELS: ReadonlyArray<{
  value: NepalProvince;
  labels: readonly string[];
}> = [
  {
    value: "Koshi",
    labels: ["Koshi", "कोशी", "कोशी प्रदेश", "Province 1", "Province No. 1"],
  },
  {
    value: "Madhesh",
    labels: ["Madhesh", "मधेश", "मधेश प्रदेश", "Province 2", "Province No. 2"],
  },
  {
    value: "Bagmati",
    labels: ["Bagmati", "बागमती", "बागमती प्रदेश", "Province 3", "Province No. 3"],
  },
  {
    value: "Gandaki",
    labels: ["Gandaki", "गण्डकी", "गण्डकी प्रदेश", "Province 4", "Province No. 4"],
  },
  {
    value: "Lumbini",
    labels: ["Lumbini", "लुम्बिनी", "लुम्बिनी प्रदेश", "Province 5", "Province No. 5"],
  },
  {
    value: "Karnali",
    labels: ["Karnali", "कर्णाली", "कर्णाली प्रदेश", "Province 6", "Province No. 6"],
  },
  {
    value: "Sudurpashchim",
    labels: [
      "Sudurpashchim",
      "Sudurpaschim",
      "Sudurpachim",
      "Sudarpashchim",
      "Sudarpassim",
      "सुदूरपश्चिम",
      "सुदूरपश्चिम प्रदेश",
      "Province 7",
      "Province No. 7",
    ],
  },
];

function normalizeProvinceLabel(raw: string): string {
  return raw
    .trim()
    .replace(/\s*province\s*$/i, "")
    .replace(/\s*pradesh\s*$/i, "")
    .replace(/\s*प्रदेश\s*$/, "")
    .trim()
    .toLowerCase();
}

/** Returns English province for checkout, or "" if no match. */
export function mapNepalProvince(raw?: string): NepalProvince | "" {
  if (!raw?.trim()) return "";

  const normalized = normalizeProvinceLabel(raw);
  for (const entry of NEPAL_PROVINCE_LABELS) {
    for (const label of entry.labels) {
      if (normalizeProvinceLabel(label) === normalized) {
        return entry.value;
      }
    }
  }
  return "";
}
