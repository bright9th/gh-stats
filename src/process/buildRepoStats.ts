import { RepoRecord } from "../types/record.js";
import { writeJson } from "../io/write-json.js";
import { loadJson } from "../io/load-json.js";

export async function process(): Promise<void> {
  const repos = await loadJson<RepoRecord[]>("data/raw/repos.json");

  const stats = repos.map((repo) => ({
    repo: repo.name,

    language: repo.language,

    stars: repo.stargazers_count,

    forks: repo.forks_count,
  }));

  await writeJson("data/processed/repo-stats.json", {
    generated_at: new Date().toISOString(),

    records: stats,
  });
}
