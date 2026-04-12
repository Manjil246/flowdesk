import { App } from "./app";
import { MongoDB } from "./config/connectToMongo";

import { PORT } from "./config/imports";

async function startServer() {
  try {
    await MongoDB.getInstance().connect();

    // Initialize Express app
    const app = new App();

    const server = app.getApp().listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
