export function isDarkColor(hex: string): boolean {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return false;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128;
}
