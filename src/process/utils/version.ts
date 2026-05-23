export function detectVersionType(
  tag: string,
): "major" | "minor" | "patch" | "other" {
  const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    return "other";
  }

  const [, major, minor, patch] = match;

  if (patch !== "0") {
    return "patch";
  }

  if (minor !== "0") {
    return "minor";
  }

  if (major !== "0") {
    return "major";
  }

  return "other";
}
