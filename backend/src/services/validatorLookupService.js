import axios from "axios";
import dotenv from "dotenv";
import { logInfo, logError } from "../utils/logger.js";

dotenv.config();
const BEACON_RPC = process.env.BEACON_RPC;

/**
 * Convert public keys to validator indices.
 * Returns { indices: number[], pubkeyMap: { [index]: pubkey } }
 */
export async function getValidatorIndices(pubkeys) {
  const pubkeyMap = {};

  const requests = pubkeys.map(async (pubkey) => {
    try {
      const cleanPubkey = pubkey.trim();
      const url = `${BEACON_RPC}/eth/v1/beacon/states/head/validators/${encodeURIComponent(cleanPubkey)}`;
      const response = await axios.get(url);
      const index = Number(response.data?.data?.index);

      if (!isNaN(index)) {
        pubkeyMap[index] = cleanPubkey;
        return index;
      }
      return null;
    } catch (error) {
      logError(`Validator lookup failed for pubkey ${pubkey}: ${error.message}`);
      return null;
    }
  });

  const results = await Promise.all(requests);
  const indices = results.filter((i) => i !== null);

  logInfo(`Converted ${indices.length}/${pubkeys.length} pubkeys to indices`);

  return { indices, pubkeyMap };
}
