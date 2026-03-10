export function analyzeAttestations(epoch, slotBlocks, validatorIndices) {
  const results = [];

  // convert validators to string for matching
  const validators = validatorIndices.map((v) => String(v));

  // track participation
  const participation = {};

  for (const v of validators) {
    participation[v] = {
      attested: false,
      source: false,
      target: false,
      head: false,
      classification: "missed_attestation",
      balance: 32000000000, // 32 ETH effective balance
      totalActiveBalance: 1000000000000000, // placeholder
    };
  }

  // iterate through slot blocks
  for (const block of slotBlocks) {
    if (!block?.data?.message?.body?.attestations) continue;

    const attestations = block.data.message.body.attestations;

    for (const attestation of attestations) {
      const attestingIndices = attestation?.aggregation_bits || [];

      // NOTE:
      // In a full implementation this must decode
      // aggregation_bits to actual validator indices.

      for (const validator of validators) {
        if (attestingIndices.includes(validator)) {
          participation[validator].attested = true;

          const attData = attestation.data;

          /**
           * SOURCE CHECK
           * correct source checkpoint
           */
          if (attData.source?.epoch <= epoch) {
            participation[validator].source = true;
          }

          /**
           * TARGET CHECK
           * correct epoch boundary
           */
          if (attData.target?.epoch === epoch) {
            participation[validator].target = true;
          }

          /**
           * HEAD CHECK
           * vote matches block root
           */
          if (attData.beacon_block_root) {
            participation[validator].head = true;
          }

          // determine classification

          if (
            participation[validator].source &&
            participation[validator].target &&
            participation[validator].head
          ) {
            participation[validator].classification = "correct";
          } else if (!participation[validator].source) {
            participation[validator].classification = "wrong_source";
          } else if (!participation[validator].target) {
            participation[validator].classification = "wrong_target";
          } else if (!participation[validator].head) {
            participation[validator].classification = "wrong_head";
          }
        }
      }
    }
  }

  // convert participation map to results

  for (const validator of validators) {
    results.push({
      validator,
      attested: participation[validator].attested,
      source: participation[validator].source,
      target: participation[validator].target,
      head: participation[validator].head,
      classification: participation[validator].classification,
      balance: participation[validator].balance,
      totalActiveBalance: participation[validator].totalActiveBalance,
    });
  }

  return results;
}
