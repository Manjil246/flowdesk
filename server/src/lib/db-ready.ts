import mongoose from "mongoose";
import { MONGODB_URI } from "../config/imports";

export function isMongoReady(): boolean {
  return Boolean(MONGODB_URI?.trim()) && mongoose.connection.readyState === 1;
}
