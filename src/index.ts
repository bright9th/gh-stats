import path from "node:path";
import fg from "fast-glob";

import { fetchManifest } from "./fetch/fetchManifest.js";
import { fetchDatasets } from "./fetch/fetchDatasets.js";
import { pathToFileURL } from "node:url";

async function main(): Promise<void> {
  // fetch
  const manifest = await fetchManifest();
  await fetchDatasets(manifest);
  console.log();

  // process
  const files = await fg("src/process/**.ts", {
    absolute: true,
  });

  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);

    if (!mod.process) {
      continue;
    }

    const fileName = path.basename(file);

    console.log(`Running '${fileName}'...`);

    await mod.process();
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
