import fs from "node:fs/promises";
import path from "node:path";

import { SCHEMA_VERSION } from "../config/schema";
import { sha256, nowIso } from "@gh-stats/utils";
import { readText, writeJson } from "@gh-stats/io";

type DatasetManifest = {
  path: string;

  queries: number;

  sha256: string;
};

export async function generateManifest(dataDir: string) {
  const entries = await fs.readdir(dataDir, {
    withFileTypes: true,
  });

  const datasets: Record<string, DatasetManifest> = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const datasetName = entry.name;

    const datasetPath = path.join(dataDir, datasetName, "current.json");

    try {
      const content = await readText(datasetPath);

      const parsed = JSON.parse(content);

      datasets[datasetName] = {
        path: datasetPath,

        queries: Object.keys(parsed || {}).length,

        sha256: sha256(content),
      };
    } catch {
      // ignore missing datasets
    }
  }

  await writeJson(`${dataDir}/data.manifest.json`, {
    schema_version: SCHEMA_VERSION,

    generated_at: nowIso(),

    datasets,
  });
}
