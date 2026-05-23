import { PullRequestRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "pull-requests";

export async function process(): Promise<void> {
  const raw = await loadJson<PullRequestRecord[]>(
    `data/raw/${processName}.json`,
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

  const stats = raw.map((pullRequest) => {
    const createdAt = new Date(pullRequest.created_at);

    const updatedAt = new Date(pullRequest.updated_at);

    const closedAt = pullRequest.closed_at
      ? new Date(pullRequest.closed_at)
      : null;

    const ageDays = daysBetween(createdAt, now);

    const updatedDaysAgo = daysBetween(updatedAt, now);

    const lifespan =
      closedAt !== null ? daysBetween(createdAt, closedAt) : null;

    const isClosed = pullRequest.state === "closed";

    if (isClosed) {
      closedCount++;

      if (lifespan !== null) {
        lifespanDays.push(lifespan);
      }
    } else {
      openCount++;
    }

    updateDays.push(updatedDaysAgo);

    totalComments += pullRequest.comments;

    const repoStats = repoMap.get(pullRequest.repo);

    if (repoStats) {
      repoStats.total += 1;
      repoStats.comments += pullRequest.comments;

      if (isClosed) {
        repoStats.closed += 1;
      } else {
        repoStats.open += 1;
      }
    } else {
      repoMap.set(pullRequest.repo, {
        total: 1,
        open: isClosed ? 0 : 1,
        closed: isClosed ? 1 : 0,
        comments: pullRequest.comments,
      });
    }

    for (const label of pullRequest.labels) {
      labelMap.set(label, (labelMap.get(label) ?? 0) + 1);
    }

    for (const assignee of pullRequest.assignees) {
      assigneeMap.set(assignee, (assigneeMap.get(assignee) ?? 0) + 1);
    }

    if (pullRequest.author !== null) {
      authorMap.set(
        pullRequest.author,
        (authorMap.get(pullRequest.author) ?? 0) + 1,
      );
    }

    const year = createdAt.getUTCFullYear();

    creationYears.set(year, (creationYears.get(year) ?? 0) + 1);

    return {
      id: pullRequest.id,

      repo: pullRequest.repo,

      number: pullRequest.number,

      title: pullRequest.title,

      state: pullRequest.state,

      author: pullRequest.author,

      assignees: pullRequest.assignees,

      labels: pullRequest.labels,

      comments: pullRequest.comments,

      pullRequestUrl: pullRequest.pull_request_url,

      createdYear: year,

      ageDays,

      updatedDaysAgo,

      lifespanDays: lifespan,

      isClosed,

      hasComments: pullRequest.comments > 0,

      labelCount: pullRequest.labels.length,

      assigneeCount: pullRequest.assignees.length,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      totalPullRequests: stats.total,

      openPullRequests: stats.open,
      closedPullRequests: stats.closed,

      totalComments: stats.comments,

      averageComments: stats.total > 0 ? stats.comments / stats.total : 0,

      closureRate: stats.total > 0 ? stats.closed / stats.total : 0,
    }))
    .sort((a, b) => b.totalPullRequests - a.totalPullRequests);

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
      pullRequests: count,
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

  const topCommentedPullRequests = [...stats]
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 25)
    .map((pullRequest) => ({
      repo: pullRequest.repo,
      number: pullRequest.number,
      title: pullRequest.title,
      comments: pullRequest.comments,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalPullRequests: raw.length,

      openPullRequests: openCount,
      closedPullRequests: closedCount,

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

    topCommentedPullRequests,
  });
}
