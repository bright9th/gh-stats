import { MilestoneRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "milestones";

export async function process(): Promise<void> {
  const raw = await loadJson<MilestoneRecord[]>(`data/raw/${processName}.json`);

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      milestones: number;
      open: number;
      closed: number;
      issues: number;
    }
  >();

  const creatorMap = new Map<string, number>();

  const stateMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let openMilestones = 0;

  let closedMilestones = 0;

  let totalOpenIssues = 0;

  let totalClosedIssues = 0;

  const milestoneAges: number[] = [];

  const closureDurations: number[] = [];

  const completionRates: number[] = [];

  const stats = raw.map((milestone) => {
    const createdAt = new Date(milestone.created_at);

    const updatedAt = new Date(milestone.updated_at);

    const closedAt = milestone.closed_at ? new Date(milestone.closed_at) : null;

    const dueOn = milestone.due_on ? new Date(milestone.due_on) : null;

    const createdYear = createdAt.getUTCFullYear();

    const ageDays = daysBetween(createdAt, now);

    const closureDurationDays =
      closedAt !== null ? daysBetween(createdAt, closedAt) : null;

    const totalIssues = milestone.open_issues + milestone.closed_issues;

    const completionRate =
      totalIssues > 0 ? milestone.closed_issues / totalIssues : 0;

    milestoneAges.push(ageDays);

    completionRates.push(completionRate);

    if (closureDurationDays !== null) {
      closureDurations.push(closureDurationDays);
    }

    totalOpenIssues += milestone.open_issues;

    totalClosedIssues += milestone.closed_issues;

    if (milestone.state === "open") {
      openMilestones++;
    }

    if (milestone.state === "closed") {
      closedMilestones++;
    }

    creationYears.set(createdYear, (creationYears.get(createdYear) ?? 0) + 1);

    const repoStats = repoMap.get(milestone.repo);

    if (repoStats) {
      repoStats.milestones += 1;
      repoStats.issues += totalIssues;

      if (milestone.state === "open") {
        repoStats.open += 1;
      }

      if (milestone.state === "closed") {
        repoStats.closed += 1;
      }
    } else {
      repoMap.set(milestone.repo, {
        milestones: 1,
        open: milestone.state === "open" ? 1 : 0,
        closed: milestone.state === "closed" ? 1 : 0,
        issues: totalIssues,
      });
    }

    if (milestone.creator !== null) {
      creatorMap.set(
        milestone.creator,
        (creatorMap.get(milestone.creator) ?? 0) + 1,
      );
    }

    stateMap.set(milestone.state, (stateMap.get(milestone.state) ?? 0) + 1);

    const isOverdue =
      dueOn !== null && closedAt === null && dueOn.getTime() < now.getTime();

    return {
      id: milestone.id,

      repo: milestone.repo,

      number: milestone.number,

      title: milestone.title,

      state: milestone.state,

      creator: milestone.creator,

      openIssues: milestone.open_issues,

      closedIssues: milestone.closed_issues,

      totalIssues,

      completionRate,

      createdYear,

      ageDays,

      closureDurationDays,

      dueInDays: dueOn !== null ? daysBetween(now, dueOn) : null,

      descriptionLength: milestone.description?.length ?? 0,

      hasDescription: milestone.description !== null,

      hasDueDate: milestone.due_on !== null,

      isOverdue,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      milestones: stats.milestones,

      openMilestones: stats.open,

      closedMilestones: stats.closed,

      totalIssues: stats.issues,

      closureRate: stats.milestones > 0 ? stats.closed / stats.milestones : 0,
    }))
    .sort((a, b) => b.milestones - a.milestones);

  const creatorStats = [...creatorMap.entries()]
    .map(([creator, milestones]) => ({
      creator,
      milestones,
    }))
    .sort((a, b) => b.milestones - a.milestones);

  const stateStats = [...stateMap.entries()]
    .map(([state, milestones]) => ({
      state,
      milestones,
    }))
    .sort((a, b) => b.milestones - a.milestones);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, milestones]) => ({
      year,
      milestones,
    }))
    .sort((a, b) => a.year - b.year);

  const averageMilestoneAgeDays =
    milestoneAges.length > 0
      ? milestoneAges.reduce((a, b) => a + b, 0) / milestoneAges.length
      : 0;

  const averageClosureDurationDays =
    closureDurations.length > 0
      ? closureDurations.reduce((a, b) => a + b, 0) / closureDurations.length
      : 0;

  const averageCompletionRate =
    completionRates.length > 0
      ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
      : 0;

  const topLargestMilestones = [...stats]
    .sort((a, b) => b.totalIssues - a.totalIssues)
    .slice(0, 25)
    .map((milestone) => ({
      repo: milestone.repo,
      title: milestone.title,
      totalIssues: milestone.totalIssues,
      completionRate: milestone.completionRate,
    }));

  const overdueMilestones = [...stats]
    .filter((milestone) => milestone.isOverdue)
    .slice(0, 25)
    .map((milestone) => ({
      repo: milestone.repo,
      title: milestone.title,
      dueInDays: milestone.dueInDays,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalMilestones: raw.length,

      openMilestones,

      closedMilestones,

      totalOpenIssues,

      totalClosedIssues,

      averageMilestoneAgeDays,

      averageClosureDurationDays,

      averageCompletionRate,

      uniqueRepositories: repoStats.length,

      uniqueCreators: creatorStats.length,
    },

    repos: repoStats,

    creators: creatorStats,

    states: stateStats,

    creationTimeline,

    topLargestMilestones,

    overdueMilestones,
  });
}
