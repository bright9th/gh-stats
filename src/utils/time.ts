export function nowIso() {
  return new Date().toISOString();
}

export function durationMs(start: number) {
  return Date.now() - start;
}
