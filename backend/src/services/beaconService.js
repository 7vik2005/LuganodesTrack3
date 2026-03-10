import axios from "axios";

const BEACON_RPC = process.env.BEACON_RPC;

export async function fetchBlock(slot) {
  const url = `${BEACON_RPC}/eth/v2/beacon/blocks/${slot}`;

  const response = await axios.get(url);

  return response.data;
}

export async function fetchAttestations(slot) {
  const url = `${BEACON_RPC}/eth/v1/beacon/blocks/${slot}/attestations`;

  const response = await axios.get(url);

  return response.data;
}

export async function fetchValidators(state = "head") {
  const url = `${BEACON_RPC}/eth/v1/beacon/states/${state}/validators`;

  const response = await axios.get(url);

  return response.data;
}
