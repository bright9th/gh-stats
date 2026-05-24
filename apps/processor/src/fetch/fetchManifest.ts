import type { FetchManifest } from "../types/manifest.js";
import { MANIFEST_URL } from "../constants.js";
import { writeJson } from "@gh-stats/io";
import { SCHEMA_VERSION } from "../config/schema.js";

export async function fetchManifest(): Promise<FetchManifest> {
  console.log("Fetching manifest...");

  const response = await fetch(MANIFEST_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.status}`);
  }

  const manifest = (await response.json()) as FetchManifest;

  if (manifest.schema_version != SCHEMA_VERSION) {
    throw new Error(
      `Incompatible SCHEMA_VERSION. Expected '${SCHEMA_VERSION}' but got '${manifest.schema_version}'.`,
    );
  }

  await writeJson("../../data/raw/data.manifest.json", manifest);

  return manifest;
}
