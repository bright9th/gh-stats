import { IssueRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "issues";

export async function process(): Promise<void> {
  const raw = await loadJson<IssueRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      total: number;
      open: number;
      closed: number;
      comments: number;
    }
  >();

  const labelMap = new Map<string, number>();

  const assigneeMap = new Map<string, number>();

  const authorMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let openCount = 0;
  let closedCount = 0;

  let totalComments = 0;

  const lifespanDays: number[] = [];
  const updateDays: number[] = [];

  const stats = raw.map((issue) => {
    const createdAt = new Date(issue.created_at);

    const updatedAt = new Date(issue.updated_at);

    const closedAt = issue.closed_at ? new Date(issue.closed_at) : null;

    const ageDays = daysBetween(createdAt, now);

    const updatedDaysAgo = daysBetween(updatedAt, now);

    const lifespan =
      closedAt !== null ? daysBetween(createdAt, closedAt) : null;

    const isClosed = issue.state === "closed";

    if (isClosed) {
      closedCount++;

      if (lifespan !== null) {
        lifespanDays.push(lifespan);
      }
    } else {
      openCount++;
    }

    updateDays.push(updatedDaysAgo);

    totalComments += issue.comments;

    const repoStats = repoMap.get(issue.repo);

    if (repoStats) {
      repoStats.total += 1;
      repoStats.comments += issue.comments;

      if (isClosed) {
        repoStats.closed += 1;
      } else {
        repoStats.open += 1;
      }
    } else {
      repoMap.set(issue.repo, {
        total: 1,
        open: isClosed ? 0 : 1,
        closed: isClosed ? 1 : 0,
        comments: issue.comments,
      });
    }

    for (const label of issue.labels) {
      labelMap.set(label, (labelMap.get(label) ?? 0) + 1);
    }

    for (const assignee of issue.assignees) {
      assigneeMap.set(assignee, (assigneeMap.get(assignee) ?? 0) + 1);
    }

    if (issue.author !== null) {
      authorMap.set(issue.author, (authorMap.get(issue.author) ?? 0) + 1);
    }

    const year = createdAt.getUTCFullYear();

    creationYears.set(year, (creationYears.get(year) ?? 0) + 1);

    return {
      id: issue.id,

      repo: issue.repo,

      number: issue.number,

      title: issue.title,

      state: issue.state,

      author: issue.author,

      assignees: issue.assignees,

      labels: issue.labels,

      comments: issue.comments,

      createdYear: year,

      ageDays,

      updatedDaysAgo,

      lifespanDays: lifespan,

      isClosed,

      hasComments: issue.comments > 0,

      labelCount: issue.labels.length,

      assigneeCount: issue.assignees.length,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      totalIssues: stats.total,

      openIssues: stats.open,
      closedIssues: stats.closed,

      totalComments: stats.comments,

      averageComments: stats.total > 0 ? stats.comments / stats.total : 0,

      closureRate: stats.total > 0 ? stats.closed / stats.total : 0,
    }))
    .sort((a, b) => b.totalIssues - a.totalIssues);

  const labelStats = [...labelMap.entries()]
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const assigneeStats = [...assigneeMap.entries()]
    .map(([assignee, count]) => ({
      assignee,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const authorStats = [...authorMap.entries()]
    .map(([author, count]) => ({
      author,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, count]) => ({
      year,
      issues: count,
    }))
    .sort((a, b) => a.year - b.year);

  const averageLifespanDays =
    lifespanDays.length > 0
      ? lifespanDays.reduce((a, b) => a + b, 0) / lifespanDays.length
      : 0;

  const averageUpdatedDays =
    updateDays.length > 0
      ? updateDays.reduce((a, b) => a + b, 0) / updateDays.length
      : 0;

  const topCommentedIssues = [...stats]
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 25)
    .map((issue) => ({
      repo: issue.repo,
      number: issue.number,
      title: issue.title,
      comments: issue.comments,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalIssues: raw.length,

      openIssues: openCount,
      closedIssues: closedCount,

      totalComments,

      averageComments: raw.length > 0 ? totalComments / raw.length : 0,

      averageLifespanDays,

      averageUpdatedDays,

      closureRate: raw.length > 0 ? closedCount / raw.length : 0,
    },

    repos: repoStats,

    labels: labelStats,

    assignees: assigneeStats,

    authors: authorStats,

    creationTimeline,

    topCommentedIssues,
  });
}
