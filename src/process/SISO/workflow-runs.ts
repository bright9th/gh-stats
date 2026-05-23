import { WorkflowRunRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "workflow-runs";

export async function process(): Promise<void> {
  const raw = await loadJson<WorkflowRunRecord[]>(
    `data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      total: number;
      successful: number;
      failed: number;
    }
  >();

  const workflowMap = new Map<
    string,
    {
      total: number;
      successful: number;
      failed: number;
    }
  >();

  const eventMap = new Map<string, number>();

  const statusMap = new Map<string, number>();

  const conclusionMap = new Map<string, number>();

  const branchMap = new Map<string, number>();

  const actorMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let successfulRuns = 0;

  let failedRuns = 0;

  let completedRuns = 0;

  const updateDurations: number[] = [];

  const stats = raw.map((workflowRun) => {
    const createdAt = new Date(workflowRun.created_at);

    const updatedAt = new Date(workflowRun.updated_at);

    const createdYear = createdAt.getUTCFullYear();

    const ageDays = daysBetween(createdAt, now);

    const updateDurationMinutes = Math.max(
      0,
      Math.floor((updatedAt.getTime() - createdAt.getTime()) / 60000),
    );

    updateDurations.push(updateDurationMinutes);

    creationYears.set(createdYear, (creationYears.get(createdYear) ?? 0) + 1);

    eventMap.set(workflowRun.event, (eventMap.get(workflowRun.event) ?? 0) + 1);

    const status = workflowRun.status ?? "unknown";

    statusMap.set(status, (statusMap.get(status) ?? 0) + 1);

    const conclusion = workflowRun.conclusion ?? "unknown";

    conclusionMap.set(conclusion, (conclusionMap.get(conclusion) ?? 0) + 1);

    if (workflowRun.head_branch !== null) {
      branchMap.set(
        workflowRun.head_branch,
        (branchMap.get(workflowRun.head_branch) ?? 0) + 1,
      );
    }

    if (workflowRun.actor !== null) {
      actorMap.set(
        workflowRun.actor,
        (actorMap.get(workflowRun.actor) ?? 0) + 1,
      );
    }

    const isSuccessful = workflowRun.conclusion === "success";

    const isFailed = workflowRun.conclusion === "failure";

    if (isSuccessful) {
      successfulRuns++;
    }

    if (isFailed) {
      failedRuns++;
    }

    if (workflowRun.status === "completed") {
      completedRuns++;
    }

    const repoStats = repoMap.get(workflowRun.repo);

    if (repoStats) {
      repoStats.total += 1;

      if (isSuccessful) {
        repoStats.successful += 1;
      }

      if (isFailed) {
        repoStats.failed += 1;
      }
    } else {
      repoMap.set(workflowRun.repo, {
        total: 1,
        successful: isSuccessful ? 1 : 0,
        failed: isFailed ? 1 : 0,
      });
    }

    const workflowName =
      workflowRun.name ?? `workflow-${workflowRun.workflow_id}`;

    const workflowStats = workflowMap.get(workflowName);

    if (workflowStats) {
      workflowStats.total += 1;

      if (isSuccessful) {
        workflowStats.successful += 1;
      }

      if (isFailed) {
        workflowStats.failed += 1;
      }
    } else {
      workflowMap.set(workflowName, {
        total: 1,
        successful: isSuccessful ? 1 : 0,
        failed: isFailed ? 1 : 0,
      });
    }

    return {
      id: workflowRun.id,

      repo: workflowRun.repo,

      workflowId: workflowRun.workflow_id,

      name: workflowRun.name,

      branch: workflowRun.head_branch,

      event: workflowRun.event,

      status: workflowRun.status,

      conclusion: workflowRun.conclusion,

      actor: workflowRun.actor,

      runNumber: workflowRun.run_number,

      createdYear,

      ageDays,

      updateDurationMinutes,

      isCompleted: workflowRun.status === "completed",

      isSuccessful,

      isFailed,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      totalRuns: stats.total,

      successfulRuns: stats.successful,

      failedRuns: stats.failed,

      successRate: stats.total > 0 ? stats.successful / stats.total : 0,

      failureRate: stats.total > 0 ? stats.failed / stats.total : 0,
    }))
    .sort((a, b) => b.totalRuns - a.totalRuns);

  const workflowStats = [...workflowMap.entries()]
    .map(([workflow, stats]) => ({
      workflow,

      totalRuns: stats.total,

      successfulRuns: stats.successful,

      failedRuns: stats.failed,

      successRate: stats.total > 0 ? stats.successful / stats.total : 0,
    }))
    .sort((a, b) => b.totalRuns - a.totalRuns);

  const eventStats = [...eventMap.entries()]
    .map(([event, count]) => ({
      event,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const statusStats = [...statusMap.entries()]
    .map(([status, count]) => ({
      status,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const conclusionStats = [...conclusionMap.entries()]
    .map(([conclusion, count]) => ({
      conclusion,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const branchStats = [...branchMap.entries()]
    .map(([branch, count]) => ({
      branch,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const actorStats = [...actorMap.entries()]
    .map(([actor, count]) => ({
      actor,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, runs]) => ({
      year,
      runs,
    }))
    .sort((a, b) => a.year - b.year);

  const averageUpdateDurationMinutes =
    updateDurations.length > 0
      ? updateDurations.reduce((a, b) => a + b, 0) / updateDurations.length
      : 0;

  const longestRuns = [...stats]
    .sort((a, b) => b.updateDurationMinutes - a.updateDurationMinutes)
    .slice(0, 25)
    .map((run) => ({
      repo: run.repo,
      workflow: run.name,
      durationMinutes: run.updateDurationMinutes,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalRuns: raw.length,

      completedRuns,

      successfulRuns,

      failedRuns,

      successRate: raw.length > 0 ? successfulRuns / raw.length : 0,

      failureRate: raw.length > 0 ? failedRuns / raw.length : 0,

      averageUpdateDurationMinutes,
    },

    repos: repoStats,

    workflows: workflowStats,

    events: eventStats,

    statuses: statusStats,

    conclusions: conclusionStats,

    branches: branchStats,

    actors: actorStats,

    creationTimeline,

    longestRuns,
  });
}
