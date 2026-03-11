import dotenv from "dotenv";
import app from "./app.js";
import { logInfo, logError } from "./utils/logger.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
try {
  const server = app.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`);
  });
  // Allow long-running requests (1 hour) — epoch processing can take time
  server.timeout = 3600000;
  server.headersTimeout = 3660000;
  server.requestTimeout = 3600000;
  server.keepAliveTimeout = 3600000;
} catch (error) {
  logError("Failed to start server");
}
