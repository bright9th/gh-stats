import fs from "node:fs/promises";

export async function loadJson<T>(path: string): Promise<T> {
  const raw = await fs.readFile(path, "utf8");

  return JSON.parse(raw);
}
