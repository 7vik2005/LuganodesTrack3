import dotenv from "dotenv";
import app from "./app.js";
import { logInfo, logError } from "./utils/logger.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
try {
  app.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`);
  });
} catch (error) {
  logError("Failed to start server");
}
