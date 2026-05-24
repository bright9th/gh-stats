import { EnvironmentRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "environments";

export async function process(): Promise<void> {
  const raw = await loadJson<EnvironmentRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      environments: number;
      protectionRules: number;
    }
  >();

  const environmentNameMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let protectedEnvironments = 0;

  let totalProtectionRules = 0;

  const environmentAges: number[] = [];

  const updateDurations: number[] = [];

  const stats = raw.map((environment) => {
    const createdAt = new Date(environment.created_at);

    const updatedAt = new Date(environment.updated_at);

    const createdYear = createdAt.getUTCFullYear();

    const ageDays = daysBetween(createdAt, now);

    const updateDurationDays = daysBetween(createdAt, updatedAt);

    environmentAges.push(ageDays);

    updateDurations.push(updateDurationDays);

    totalProtectionRules += environment.protection_rules_count;

    if (environment.protection_rules_count > 0) {
      protectedEnvironments++;
    }

    creationYears.set(createdYear, (creationYears.get(createdYear) ?? 0) + 1);

    const repoStats = repoMap.get(environment.repo);

    if (repoStats) {
      repoStats.environments += 1;
      repoStats.protectionRules += environment.protection_rules_count;
    } else {
      repoMap.set(environment.repo, {
        environments: 1,
        protectionRules: environment.protection_rules_count,
      });
    }

    environmentNameMap.set(
      environment.name,
      (environmentNameMap.get(environment.name) ?? 0) + 1,
    );

    return {
      repo: environment.repo,

      id: environment.id,

      name: environment.name,

      protectionRules: environment.protection_rules_count,

      createdYear,

      ageDays,

      updateDurationDays,

      isProtected: environment.protection_rules_count > 0,

      nameLength: environment.name.length,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      environments: stats.environments,

      protectionRules: stats.protectionRules,

      averageProtectionRules:
        stats.environments > 0 ? stats.protectionRules / stats.environments : 0,
    }))
    .sort((a, b) => b.environments - a.environments);

  const environmentNameStats = [...environmentNameMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, environments]) => ({
      year,
      environments,
    }))
    .sort((a, b) => a.year - b.year);

  const averageEnvironmentAgeDays =
    environmentAges.length > 0
      ? environmentAges.reduce((a, b) => a + b, 0) / environmentAges.length
      : 0;

  const averageUpdateDurationDays =
    updateDurations.length > 0
      ? updateDurations.reduce((a, b) => a + b, 0) / updateDurations.length
      : 0;

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    environments: repo.environments,
    protectionRules: repo.protectionRules,
  }));

  const mostProtectedEnvironments = [...stats]
    .sort((a, b) => b.protectionRules - a.protectionRules)
    .slice(0, 25)
    .map((environment) => ({
      repo: environment.repo,
      name: environment.name,
      protectionRules: environment.protectionRules,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalEnvironments: raw.length,

      protectedEnvironments,

      unprotectedEnvironments: raw.length - protectedEnvironments,

      totalProtectionRules,

      averageEnvironmentAgeDays,

      averageUpdateDurationDays,

      uniqueRepositories: repoStats.length,

      uniqueEnvironmentNames: environmentNameStats.length,
    },

    repos: repoStats,

    environmentNames: environmentNameStats,

    creationTimeline,

    topRepositories,

    mostProtectedEnvironments,
  });
}
