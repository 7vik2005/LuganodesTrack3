export function epochToSlots(epoch) {
  const start = epoch * 32;
  const end = start + 31;

  return { start, end };
}
