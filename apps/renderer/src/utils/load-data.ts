import { loadJson } from "@gh-stats/io";

export function loadDataSISO<T>(name: string) {
  return loadJson<T>(`../../data/processed/SISO/${name}/current.json`);
}
