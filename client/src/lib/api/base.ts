/** API origin the browser calls (local dev or deployed server URL). */
export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
}
