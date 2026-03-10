export function logInfo(message) {
  const timestamp = new Date().toISOString();

  console.log(`[INFO] [${timestamp}] ${message}`);
}

export function logWarning(message) {
  const timestamp = new Date().toISOString();

  console.warn(`[WARN] [${timestamp}] ${message}`);
}

export function logError(message) {
  const timestamp = new Date().toISOString();

  console.error(`[ERROR] [${timestamp}] ${message}`);
}
