import type { Manifest } from "../types/manifest.js";
import { MANIFEST_URL } from "../constants.js";
import { writeJson } from "../io/write-json.js";
import { SCHEMA_VERSION } from "../config/schema.js";

export async function fetchManifest(): Promise<Manifest> {
  console.log("Fetching manifest...");

  const response = await fetch(MANIFEST_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.status}`);
  }

  const manifest = (await response.json()) as Manifest;

  if (manifest.schema_version != SCHEMA_VERSION) {
    throw new Error(
      `Incompatible SCHEMA_VERSION. Expected '${SCHEMA_VERSION}' but got '${manifest.schema_version}'.`,
    );
  }

  await writeJson("data/raw/manifest.json", manifest);

  return manifest;
}
