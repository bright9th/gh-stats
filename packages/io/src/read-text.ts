import fs from "node:fs/promises";

export async function readText(path: string) {
  return fs.readFile(path, "utf8");
}
