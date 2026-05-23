import { byteSize } from "../utils/byte";
import { writeJson } from "./write-json";
import { writeSnapshot } from "./write-snapshots";

export async function writeProcessedSISO(name: String, data: unknown) {
  const path = `data/processed/SISO/${name}/current.json`;
  await writeJson(path, data);
  await writeSnapshot(path);
  console.log(`- ${byteSize(data)} bytes written.`);
}

export async function writeProcessed(name: String, data: unknown) {
  const path = `data/processed/MISO/${name}/current.json`;
  await writeJson(path, data);
  await writeSnapshot(path);
  console.log(`- ${byteSize(data)} bytes written.`);
}
