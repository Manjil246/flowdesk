/** MongoDB not configured or not connected (HTTP 503). */
export class DbNotReadyError extends Error {
  constructor(message = "Database not connected") {
    super(message);
    this.name = "DbNotReadyError";
  }
}

/** Resource not found (HTTP 404). */
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Invalid request / state (HTTP 400). */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

/** Public image URL failed HEAD/GET probe before WhatsApp send (bad link, timeout, non-image). */
export class ImageUrlUnreachableError extends BadRequestError {
  constructor(message: string) {
    super(message);
    this.name = "ImageUrlUnreachableError";
  }
}

/** Missing or invalid WhatsApp env configuration (HTTP 503). */
export class WhatsAppConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppConfigError";
  }
}

/** Meta Graph API returned an error (HTTP 502). */
export class WhatsAppApiError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly metaBody?: unknown,
  ) {
    super(message);
    this.name = "WhatsAppApiError";
  }
}
