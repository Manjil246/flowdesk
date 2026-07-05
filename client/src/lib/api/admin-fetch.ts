/** Admin API fetch — sends session cookie and redirects to login on 401. */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/admin/login")
  ) {
    const redirect = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );
    window.location.href = `/admin/login?redirect=${redirect}`;
  }

  return res;
}
