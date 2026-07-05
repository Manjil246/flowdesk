import { App } from "../src/app";

/** Vercel serverless entry — re-exports the Express app for @vercel/node. */
export default new App().getApp();
