import { ImageUrlUnreachableError } from "../errors/service.errors";

const PROBE_TIMEOUT_MS = 10_000;
const UA = "FlowDesk/1.0 (image-preflight)";

function contentTypeBase(res: Response): string {
  return (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
}

/**
 * Confirms the URL is reachable over HTTPS and returns an image/* type (HEAD, or small GET fallback).
 * WhatsApp will fetch the same URL again — this only catches obvious broken links early and gives
 * the model a clear tool error (it can re-call get_catalog_product_detail if the catalog was updated).
 */
export async function assertPublicImageUrlFetchable(urlString: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new ImageUrlUnreachableError("invalid_image_url");
  }
  if (parsed.protocol !== "https:") {
    throw new ImageUrlUnreachableError("image_url_must_use_https");
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);

  try {
    const head = await fetch(urlString, {
      method: "HEAD",
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": UA },
    });

    if (head.ok) {
      const ct = contentTypeBase(head);
      await head.body?.cancel();
      if (ct.startsWith("image/")) return;
      // HEAD succeeded but wrong/missing type — fall through to GET probe
    } else if (head.status !== 405 && head.status !== 501) {
      await head.body?.cancel();
      throw new ImageUrlUnreachableError(`image_url_http_${head.status}`);
    } else {
      await head.body?.cancel();
    }

    const get = await fetch(urlString, {
      method: "GET",
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        Range: "bytes=0-8191",
      },
    });
    if (!get.ok) {
      await get.body?.cancel();
      throw new ImageUrlUnreachableError(`image_probe_get_${get.status}`);
    }
    const ct = contentTypeBase(get);
    await get.body?.cancel();
    if (!ct.startsWith("image/")) {
      throw new ImageUrlUnreachableError(
        ct ? `image_probe_bad_type:${ct}` : "image_probe_bad_type",
      );
    }
  } catch (e: unknown) {
    if (e instanceof ImageUrlUnreachableError) throw e;
    const m = e instanceof Error ? e.message : String(e);
    throw new ImageUrlUnreachableError(
      /abort|timeout/i.test(m) ? "image_url_fetch_timeout" : `image_url_fetch:${m.slice(0, 120)}`,
    );
  } finally {
    clearTimeout(timer);
  }
}
