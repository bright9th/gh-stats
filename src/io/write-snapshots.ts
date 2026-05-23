import fs from "node:fs/promises";
import path from "node:path";

import { snapshotName } from "../utils/snapshot-name";

import { SNAPSHOT_RETENTION } from "../config/snapshots";

export async function writeSnapshot(currentPath: string) {
  const snapshotDir = path.join(path.dirname(currentPath), "snapshots");

  await fs.mkdir(snapshotDir, {
    recursive: true,
  });

  const snapshotPath = path.join(snapshotDir, `${snapshotName()}.json`);

  await fs.copyFile(currentPath, snapshotPath);

  const files = (await fs.readdir(snapshotDir))
    .filter((f) => f.endsWith(".json"))
    .sort();

  while (files.length > SNAPSHOT_RETENTION) {
    const oldest = files.shift();

    if (!oldest) {
      break;
    }

    await fs.unlink(path.join(snapshotDir, oldest));
  }
}
