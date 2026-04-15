// To use this run below commands in terminal
// npm install mongoose OR bun add mongoose
// npm install --save-dev @types/mongoose OR bun add -d @types/mongoose



import mongoose from "mongoose";
import { MONGODB_URI } from "./imports";
import { syncCatalogModelIndexes } from "../lib/sync-catalog-indexes";

export class MongoDB {
  private static instance: MongoDB;

  private constructor() {}

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  public async connect(): Promise<void> {
    if (!MONGODB_URI?.trim()) {
      console.warn("⚠️ MONGODB_URI not set — skipping MongoDB connect");
      return;
    }
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("✅ Connected to MongoDB");

      try {
        await syncCatalogModelIndexes();
        console.log("✅ Catalog indexes synced with schemas");
      } catch (e) {
        console.warn(
          "⚠️ Catalog index sync failed — you may need to drop legacy slug indexes manually:",
          e,
        );
      }

      mongoose.connection.on("error", (error: unknown) => {
        console.error("❌ MongoDB connection error:", error);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("🔌 MongoDB disconnected");
      });
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}
