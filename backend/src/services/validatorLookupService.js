import axios from "axios";
import dotenv from "dotenv";
import { logInfo, logError } from "../utils/logger.js";

dotenv.config();

const BEACON_RPC = process.env.BEACON_RPC;

export async function getValidatorIndices(pubkeys) {
  const requests = pubkeys.map(async (pubkey) => {
    try {
      const url = `${BEACON_RPC}/eth/v1/beacon/states/head/validators/${encodeURIComponent(pubkey)}`;

      const response = await axios.get(url);

      const index = response.data?.data?.index;

      return Number(index);
    } catch (error) {
      logError(`Validator lookup failed for pubkey ${pubkey}`);

      return null;
    }
  });

  const results = await Promise.all(requests);

  const indices = results.filter(Boolean);

  logInfo(`Converted ${indices.length} pubkeys to indices`);

  return indices;
}
