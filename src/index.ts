import path from "node:path";
import fg from "fast-glob";

import { fetchManifest } from "./fetch/fetchManifest.js";
import { fetchDatasets } from "./fetch/fetchDatasets.js";
import { pathToFileURL } from "node:url";
import { generateManifest } from "./io/generate-manifest.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const skipFetch = args.includes("process");

  // fetch
  if (!skipFetch) {
    const manifest = await fetchManifest();
    await fetchDatasets(manifest);
    console.log();
  }

  // process
  async function processDir(dir: string) {
    const files = await fg(`src/process/${dir}/**.ts`, {
      absolute: true,
    });

    for (const file of files) {
      const mod = await import(pathToFileURL(file).href);

      const fileName = path.basename(file);

      if (!mod.process) {
        console.log(`Skipped '${fileName}': No method 'process'`);
        continue;
      }

      console.log(`Running '${fileName}'...`);

      await mod.process();
    }

    console.log(`Generating ${dir} manifest...`);
    await generateManifest(`data/processed/${dir}`).catch(console.warn);
    console.log();
  }

  await processDir("SISO");
  await processDir("MISO");

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
