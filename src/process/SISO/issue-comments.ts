import { IssueCommentRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";
import { getWordCount } from "../utils/text.js";

const processName = "issue-comments";

export async function process(): Promise<void> {
  const raw = await loadJson<IssueCommentRecord[]>(
    `data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      comments: number;
      reactions: number;
      words: number;
    }
  >();

  const authorMap = new Map<
    string,
    {
      comments: number;
      reactions: number;
      words: number;
    }
  >();

  const issueMap = new Map<number, number>();

  const creationYears = new Map<number, number>();

  let totalReactions = 0;

  let totalWords = 0;

  const commentAges: number[] = [];

  const updateDays: number[] = [];

  const wordCounts: number[] = [];

  const stats = raw.map((comment) => {
    const createdAt = new Date(comment.created_at);

    const updatedAt = new Date(comment.updated_at);

    const createdYear = createdAt.getUTCFullYear();

    const ageDays = daysBetween(createdAt, now);

    const updatedDaysAgo = daysBetween(updatedAt, now);

    const wordCount = getWordCount(comment.body);

    const reactionCount = comment.reactions.total_count;

    commentAges.push(ageDays);

    updateDays.push(updatedDaysAgo);

    wordCounts.push(wordCount);

    totalReactions += reactionCount;

    totalWords += wordCount;

    creationYears.set(createdYear, (creationYears.get(createdYear) ?? 0) + 1);

    const repoStats = repoMap.get(comment.repo);

    if (repoStats) {
      repoStats.comments += 1;
      repoStats.reactions += reactionCount;
      repoStats.words += wordCount;
    } else {
      repoMap.set(comment.repo, {
        comments: 1,
        reactions: reactionCount,
        words: wordCount,
      });
    }

    if (comment.author !== null) {
      const authorStats = authorMap.get(comment.author);

      if (authorStats) {
        authorStats.comments += 1;
        authorStats.reactions += reactionCount;
        authorStats.words += wordCount;
      } else {
        authorMap.set(comment.author, {
          comments: 1,
          reactions: reactionCount,
          words: wordCount,
        });
      }
    }

    const issueId = Number(comment.issue_url.split("/").pop() ?? "0");

    issueMap.set(issueId, (issueMap.get(issueId) ?? 0) + 1);

    return {
      id: comment.id,

      repo: comment.repo,

      issueUrl: comment.issue_url,

      author: comment.author,

      reactionCount,

      wordCount,

      characterCount: comment.body.length,

      createdYear,

      ageDays,

      updatedDaysAgo,

      hasReactions: reactionCount > 0,

      isEdited: comment.created_at !== comment.updated_at,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      comments: stats.comments,

      reactions: stats.reactions,

      words: stats.words,

      averageWords: stats.comments > 0 ? stats.words / stats.comments : 0,

      averageReactions:
        stats.comments > 0 ? stats.reactions / stats.comments : 0,
    }))
    .sort((a, b) => b.comments - a.comments);

  const authorStats = [...authorMap.entries()]
    .map(([author, stats]) => ({
      author,

      comments: stats.comments,

      reactions: stats.reactions,

      words: stats.words,

      averageWords: stats.comments > 0 ? stats.words / stats.comments : 0,

      averageReactions:
        stats.comments > 0 ? stats.reactions / stats.comments : 0,
    }))
    .sort((a, b) => b.comments - a.comments);

  const issueStats = [...issueMap.entries()]
    .map(([issueId, comments]) => ({
      issueId,
      comments,
    }))
    .sort((a, b) => b.comments - a.comments);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, comments]) => ({
      year,
      comments,
    }))
    .sort((a, b) => a.year - b.year);

  const averageCommentAgeDays =
    commentAges.length > 0
      ? commentAges.reduce((a, b) => a + b, 0) / commentAges.length
      : 0;

  const averageUpdatedDays =
    updateDays.length > 0
      ? updateDays.reduce((a, b) => a + b, 0) / updateDays.length
      : 0;

  const averageWordCount =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

  const topReactedComments = [...stats]
    .sort((a, b) => b.reactionCount - a.reactionCount)
    .slice(0, 25)
    .map((comment) => ({
      id: comment.id,
      repo: comment.repo,
      reactionCount: comment.reactionCount,
    }));

  const longestComments = [...stats]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 25)
    .map((comment) => ({
      id: comment.id,
      repo: comment.repo,
      wordCount: comment.wordCount,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalComments: raw.length,

      totalReactions,

      totalWords,

      averageReactions: raw.length > 0 ? totalReactions / raw.length : 0,

      averageWordCount,

      averageCommentAgeDays,

      averageUpdatedDays,
    },

    repos: repoStats,

    authors: authorStats,

    issues: issueStats,

    creationTimeline,

    topReactedComments,

    longestComments,
  });
}
