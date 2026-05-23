import { BranchRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "branches";

export async function process(): Promise<void> {
  const raw = await loadJson<BranchRecord[]>(`data/raw/${processName}.json`);

  const repoMap = new Map<
    string,
    {
      branches: number;
      protected: number;
    }
  >();

  const branchNameMap = new Map<string, number>();

  const commitMap = new Map<string, number>();

  let protectedBranches = 0;

  const stats = raw.map((branch) => {
    if (branch.protected) {
      protectedBranches++;
    }

    const repoStats = repoMap.get(branch.repo);

    if (repoStats) {
      repoStats.branches += 1;

      if (branch.protected) {
        repoStats.protected += 1;
      }
    } else {
      repoMap.set(branch.repo, {
        branches: 1,
        protected: branch.protected ? 1 : 0,
      });
    }

    branchNameMap.set(branch.name, (branchNameMap.get(branch.name) ?? 0) + 1);

    commitMap.set(
      branch.commit_sha,
      (commitMap.get(branch.commit_sha) ?? 0) + 1,
    );

    return {
      repo: branch.repo,

      name: branch.name,

      protected: branch.protected,

      commitSha: branch.commit_sha,

      commitUrl: branch.commit_url,

      isDefaultLike: branch.name === "main" || branch.name === "master",

      nameLength: branch.name.length,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      branches: stats.branches,

      protectedBranches: stats.protected,

      protectedRate: stats.branches > 0 ? stats.protected / stats.branches : 0,
    }))
    .sort((a, b) => b.branches - a.branches);

  const branchNameStats = [...branchNameMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const commitStats = [...commitMap.entries()]
    .map(([commitSha, branches]) => ({
      commitSha,
      branches,
    }))
    .sort((a, b) => b.branches - a.branches);

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    branches: repo.branches,
    protectedBranches: repo.protectedBranches,
  }));

  const topBranchNames = [...branchNameStats].slice(0, 25).map((branch) => ({
    name: branch.name,
    count: branch.count,
  }));

  const sharedCommitBranches = [...commitStats]
    .filter((commit) => commit.branches > 1)
    .slice(0, 25);

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalBranches: raw.length,

      protectedBranches,

      unprotectedBranches: raw.length - protectedBranches,

      protectionRate: raw.length > 0 ? protectedBranches / raw.length : 0,

      uniqueRepositories: repoStats.length,

      uniqueBranchNames: branchNameStats.length,
    },

    repos: repoStats,

    branchNames: branchNameStats,

    commits: commitStats,

    topRepositories,

    topBranchNames,

    sharedCommitBranches,
  });
}
