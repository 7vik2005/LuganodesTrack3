import { MAX_RETRY } from "../config/constants.js";
import { logWarning, logError } from "./logger.js";

export async function retry(fn, retries = MAX_RETRY) {
  let delay = 500;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        logError(`Retry failed after ${retries} attempts`);

        throw error;
      }

      logWarning(`Retry attempt ${i + 1} failed. Retrying...`);

      await new Promise((resolve) => setTimeout(resolve, delay));

      delay *= 2;
    }
  }
}
