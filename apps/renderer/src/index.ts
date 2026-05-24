import path from "node:path";
import fg from "fast-glob";
import { pathToFileURL } from "node:url";
import { writeSvg } from "./utils/write-svg";
import { testSvg } from "./utils/test-svg";

type BuildModule = {
  buildCardData?: () => unknown | Promise<unknown>;
};

type RenderModule = {
  renderCardSvg?: (data: unknown) => string | Promise<string>;
};

async function main(): Promise<void> {
  console.log(`\n\t========== Render ==========\n`);

  writeSvg("../../data/rendered/test.svg", testSvg());
  console.log("Created test.svg");

  const rendererDirs = await fg("src/renderers/*", {
    onlyDirectories: true,
    absolute: true,
  });

  for (const rendererDir of rendererDirs) {
    const name = path.basename(rendererDir);

    const buildPath = path.join(rendererDir, "build.ts");
    const renderPath = path.join(rendererDir, "render.ts");

    try {
      const [buildModule, renderModule] = await Promise.all([
        import(pathToFileURL(buildPath).href).catch(() => null),
        import(pathToFileURL(renderPath).href).catch(() => null),
      ]);

      if (!buildModule || !renderModule) {
        continue;
      }

      const { buildCardData } = buildModule as BuildModule;
      const { renderCardSvg } = renderModule as RenderModule;

      if (
        typeof buildCardData !== "function" ||
        typeof renderCardSvg !== "function"
      ) {
        console.log(`Skipped '${name}': No method 'process'`);
        continue;
      }

      console.log(`Running '${name}'...`);

      const cardData = await buildCardData();
      const svg = await renderCardSvg(cardData);

      writeSvg(path.resolve(`../../data/rendered/${name}.svg`), svg);

      console.log(`- Built ${name}.svg`);
    } catch (error) {
      console.error(`Failed renderer '${name}':`, error);
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
