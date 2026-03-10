import axios from "axios";
import dotenv from "dotenv";

import { retry } from "../utils/retry.js";
import { logInfo, logError } from "../utils/logger.js";

dotenv.config();
const BEACON_RPC = process.env.BEACON_RPC;
export async function fetchBlock(slot) {
  const url = `${BEACON_RPC}/eth/v2/beacon/blocks/${slot}`;

  try {
    const response = await retry(() => axios.get(url));

    logInfo(`Fetched block for slot ${slot}`);

    return response.data;
  } catch (error) {
    logError(`Block fetch failed for slot ${slot}`);

    throw error;
  }
}
export async function fetchAttestations(slot) {
  const url = `${BEACON_RPC}/eth/v1/beacon/blocks/${slot}/attestations`;

  try {
    const response = await retry(() => axios.get(url));

    return response.data;
  } catch (error) {
    logError(`Attestation fetch failed for slot ${slot}`);

    throw error;
  }
}
export async function fetchValidators(state = "head") {
  const url = `${BEACON_RPC}/eth/v1/beacon/states/${state}/validators`;

  try {
    const response = await retry(() => axios.get(url));

    logInfo("Fetched validator state");

    return response.data;
  } catch (error) {
    logError("Validator state fetch failed");

    throw error;
  }
}
