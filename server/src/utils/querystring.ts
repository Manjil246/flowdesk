import type { Request } from "express";

/** First string value for a query key (Express may return string | string[]). */
export function getQueryString(
  query: Request["query"],
  key: string
): string | undefined {
  const v = query[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}
