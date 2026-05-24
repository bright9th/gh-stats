import fs from "node:fs";
import path from "node:path";

export function writeSvg(filePath: string, data: string) {
  const dir = path.dirname(filePath);

  fs.mkdirSync(dir, { recursive: true });

  const tempPath = `${filePath}.tmp`;

  fs.writeFileSync(tempPath, data, "utf8");

  fs.renameSync(tempPath, filePath);
}
