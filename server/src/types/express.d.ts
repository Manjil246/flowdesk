import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    /** Set by `validateQueryParams` after successful parse. */
    validatedQuery?: unknown;
    /** Set by `validateParams` after successful parse. */
    validatedParams?: unknown;
  }
}
