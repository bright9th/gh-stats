import fs from "node:fs/promises";
import path from "node:path";

export async function writeJson(filePath: string, data: unknown) {
  const dir = path.dirname(filePath);

  await fs.mkdir(dir, { recursive: true });

  const tempPath = `${filePath}.tmp`;

  const json = JSON.stringify(data, null, 2) + "\n";

  await fs.writeFile(tempPath, json, "utf8");

  await fs.rename(tempPath, filePath);
}
