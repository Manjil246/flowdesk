export function colorNameMatches(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexCode(value: string) {
  return HEX_RE.test(value.trim());
}

/** Normalizes #RRGGBB or RRGGBB to lowercase #rrggbb. */
export function normalizeHexCode(value: string): string {
  const v = value.trim();
  if (HEX_RE.test(v)) return v.toLowerCase();
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  throw new Error("Enter a valid hex color (#RRGGBB)");
}

export function hexForColorInput(hexCode: string) {
  return isValidHexCode(hexCode) ? normalizeHexCode(hexCode) : "#000000";
}

/** Light swatches need a visible border on white backgrounds. */
export function isLightSwatch(hexCode: string) {
  const hex = normalizeHexCode(hexCode).slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.82;
}
