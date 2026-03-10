export function reconstructParticipationFlags(attestationResults) {
  const participation = {};

  for (const result of attestationResults) {
    participation[result.epoch] = {
      attested: result.classification !== "missed_attestation",

      timelySource: result.source,
      timelyTarget: result.target,
      timelyHead: result.head,

      classification: result.classification,
    };
  }

  return participation;
}
