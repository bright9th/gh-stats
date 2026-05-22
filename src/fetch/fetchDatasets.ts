import type { Manifest } from "../types/manifest.js";
import { BASE_REPO_URL } from "../constants.js";
import { FetchReport } from "../types/report.js";
import { writeJson } from "../io/write-json.js";

export async function fetchDatasets(manifest: Manifest): Promise<void> {
  console.log("Fetching datasets...");

  const reports: FetchReport[] = [];

  for (const [name, { path }] of Object.entries(manifest.datasets)) {
    try {
      const response = await fetch(BASE_REPO_URL + path);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${name}`);
      }

      const json = await response.json();

      await writeJson(`data/raw/${name}.json`, json);

      const report: FetchReport = {
        name,
        status: "success",
        records: json.length,
      };

      reports.push(report);
      console.log(report);
    } catch (error) {
      const report: FetchReport = {
        name,
        status: "failed",
        records: 0,
        error: error instanceof Error ? error.message : String(error),
      };

      reports.push(report);
      console.log(report);
    }
  }

  const successful = reports.filter((r) => r.status === "success");

  const failed = reports.filter((r) => r.status === "failed");

  console.log(`\nSuccess: ${successful.length}\nFailed: ${failed.length}`);
}
