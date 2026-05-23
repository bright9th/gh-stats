import { CheckRunRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "check-runs";

export async function process(): Promise<void> {
  const raw = await loadJson<CheckRunRecord[]>(`data/raw/${processName}.json`);

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      runs: number;
      completed: number;
      successful: number;
    }
  >();

  const appMap = new Map<string, number>();

  const statusMap = new Map<string, number>();

  const conclusionMap = new Map<string, number>();

  const checkNameMap = new Map<string, number>();

  const shaMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let completedRuns = 0;

  let successfulRuns = 0;

  let failedRuns = 0;

  let runsWithDetailsUrl = 0;

  let runsWithExternalId = 0;

  const durations: number[] = [];

  const ages: number[] = [];

  const stats = raw.map((run) => {
    const startedAt = run.started_at ? new Date(run.started_at) : null;

    const completedAt = run.completed_at ? new Date(run.completed_at) : null;

    const createdYear = startedAt !== null ? startedAt.getUTCFullYear() : null;

    const ageDays = startedAt !== null ? daysBetween(startedAt, now) : null;

    const durationMinutes =
      startedAt !== null && completedAt !== null
        ? Math.max(
            0,
            Math.floor((completedAt.getTime() - startedAt.getTime()) / 60000),
          )
        : null;

    if (durationMinutes !== null) {
      durations.push(durationMinutes);
    }

    if (ageDays !== null) {
      ages.push(ageDays);

      creationYears.set(
        createdYear!,
        (creationYears.get(createdYear!) ?? 0) + 1,
      );
    }

    if (run.completed_at !== null) {
      completedRuns++;
    }

    if (run.conclusion === "success") {
      successfulRuns++;
    }

    if (
      run.conclusion === "failure" ||
      run.conclusion === "timed_out" ||
      run.conclusion === "cancelled"
    ) {
      failedRuns++;
    }

    if (run.details_url !== null) {
      runsWithDetailsUrl++;
    }

    if (run.external_id !== null) {
      runsWithExternalId++;
    }

    const repoStats = repoMap.get(run.repo);

    if (repoStats) {
      repoStats.runs += 1;

      if (run.completed_at !== null) {
        repoStats.completed += 1;
      }

      if (run.conclusion === "success") {
        repoStats.successful += 1;
      }
    } else {
      repoMap.set(run.repo, {
        runs: 1,

        completed: run.completed_at !== null ? 1 : 0,

        successful: run.conclusion === "success" ? 1 : 0,
      });
    }

    if (run.app !== null) {
      appMap.set(run.app, (appMap.get(run.app) ?? 0) + 1);
    }

    statusMap.set(run.status, (statusMap.get(run.status) ?? 0) + 1);

    const conclusion = run.conclusion ?? "unknown";

    conclusionMap.set(conclusion, (conclusionMap.get(conclusion) ?? 0) + 1);

    checkNameMap.set(run.name, (checkNameMap.get(run.name) ?? 0) + 1);

    shaMap.set(run.sha, (shaMap.get(run.sha) ?? 0) + 1);

    return {
      id: run.id,

      repo: run.repo,

      sha: run.sha,

      name: run.name,

      status: run.status,

      conclusion: run.conclusion,

      app: run.app,

      durationMinutes,

      ageDays,

      createdYear,

      hasDetailsUrl: run.details_url !== null,

      hasExternalId: run.external_id !== null,

      isCompleted: run.completed_at !== null,

      isSuccessful: run.conclusion === "success",

      isFailed:
        run.conclusion === "failure" ||
        run.conclusion === "timed_out" ||
        run.conclusion === "cancelled",
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      runs: stats.runs,

      completed: stats.completed,

      successful: stats.successful,

      completionRate: stats.runs > 0 ? stats.completed / stats.runs : 0,

      successRate: stats.runs > 0 ? stats.successful / stats.runs : 0,
    }))
    .sort((a, b) => b.runs - a.runs);

  const appStats = [...appMap.entries()]
    .map(([app, runs]) => ({
      app,
      runs,
    }))
    .sort((a, b) => b.runs - a.runs);

  const statusStats = [...statusMap.entries()]
    .map(([status, runs]) => ({
      status,
      runs,
    }))
    .sort((a, b) => b.runs - a.runs);

  const conclusionStats = [...conclusionMap.entries()]
    .map(([conclusion, runs]) => ({
      conclusion,
      runs,
    }))
    .sort((a, b) => b.runs - a.runs);

  const checkNameStats = [...checkNameMap.entries()]
    .map(([name, runs]) => ({
      name,
      runs,
    }))
    .sort((a, b) => b.runs - a.runs);

  const shaStats = [...shaMap.entries()]
    .map(([sha, runs]) => ({
      sha,
      runs,
    }))
    .sort((a, b) => b.runs - a.runs);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, runs]) => ({
      year,
      runs,
    }))
    .sort((a, b) => a.year - b.year);

  const averageDurationMinutes =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

  const averageAgeDays =
    ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

  const longestRuns = [...stats]
    .filter((run) => run.durationMinutes !== null)
    .sort((a, b) => (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0))
    .slice(0, 25)
    .map((run) => ({
      id: run.id,
      repo: run.repo,
      name: run.name,
      durationMinutes: run.durationMinutes,
    }));

  const mostExecutedChecks = [...checkNameStats].slice(0, 25).map((check) => ({
    name: check.name,
    runs: check.runs,
  }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalRuns: raw.length,

      completedRuns,

      successfulRuns,

      failedRuns,

      runsWithDetailsUrl,

      runsWithExternalId,

      averageDurationMinutes,

      averageAgeDays,

      uniqueRepositories: repoStats.length,

      uniqueApps: appStats.length,

      uniqueCheckNames: checkNameStats.length,
    },

    repos: repoStats,

    apps: appStats,

    statuses: statusStats,

    conclusions: conclusionStats,

    checkNames: checkNameStats,

    shas: shaStats,

    creationTimeline,

    longestRuns,

    mostExecutedChecks,
  });
}
