import { CommitCommentRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";
import { getWordCount } from "../utils/text.js";

const processName = "commit-comments";

export async function process(): Promise<void> {
  const raw = await loadJson<CommitCommentRecord[]>(
    `data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      comments: number;
      words: number;
    }
  >();

  const authorMap = new Map<
    string,
    {
      comments: number;
      words: number;
    }
  >();

  const pathMap = new Map<
    string,
    {
      comments: number;
      words: number;
    }
  >();

  const commitMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let totalWords = 0;

  let positionedComments = 0;

  let lineComments = 0;

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

    const path = comment.path ?? "unknown";

    commentAges.push(ageDays);

    updateDays.push(updatedDaysAgo);

    wordCounts.push(wordCount);

    totalWords += wordCount;

    if (comment.position !== null) {
      positionedComments++;
    }

    if (comment.line !== null) {
      lineComments++;
    }

    creationYears.set(createdYear, (creationYears.get(createdYear) ?? 0) + 1);

    const repoStats = repoMap.get(comment.repo);

    if (repoStats) {
      repoStats.comments += 1;
      repoStats.words += wordCount;
    } else {
      repoMap.set(comment.repo, {
        comments: 1,
        words: wordCount,
      });
    }

    if (comment.author !== null) {
      const authorStats = authorMap.get(comment.author);

      if (authorStats) {
        authorStats.comments += 1;
        authorStats.words += wordCount;
      } else {
        authorMap.set(comment.author, {
          comments: 1,
          words: wordCount,
        });
      }
    }

    const pathStats = pathMap.get(path);

    if (pathStats) {
      pathStats.comments += 1;
      pathStats.words += wordCount;
    } else {
      pathMap.set(path, {
        comments: 1,
        words: wordCount,
      });
    }

    commitMap.set(
      comment.commit_id,
      (commitMap.get(comment.commit_id) ?? 0) + 1,
    );

    return {
      id: comment.id,

      repo: comment.repo,

      commitId: comment.commit_id,

      author: comment.author,

      path: comment.path,

      position: comment.position,

      line: comment.line,

      wordCount,

      characterCount: comment.body.length,

      createdYear,

      ageDays,

      updatedDaysAgo,

      hasPath: comment.path !== null,

      hasPosition: comment.position !== null,

      hasLine: comment.line !== null,

      isEdited: comment.created_at !== comment.updated_at,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      comments: stats.comments,

      words: stats.words,

      averageWords: stats.comments > 0 ? stats.words / stats.comments : 0,
    }))
    .sort((a, b) => b.comments - a.comments);

  const authorStats = [...authorMap.entries()]
    .map(([author, stats]) => ({
      author,

      comments: stats.comments,

      words: stats.words,

      averageWords: stats.comments > 0 ? stats.words / stats.comments : 0,
    }))
    .sort((a, b) => b.comments - a.comments);

  const pathStats = [...pathMap.entries()]
    .map(([path, stats]) => ({
      path,

      comments: stats.comments,

      words: stats.words,

      averageWords: stats.comments > 0 ? stats.words / stats.comments : 0,
    }))
    .sort((a, b) => b.comments - a.comments);

  const commitStats = [...commitMap.entries()]
    .map(([commitId, comments]) => ({
      commitId,
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

  const topLongestComments = [...stats]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 25)
    .map((comment) => ({
      id: comment.id,
      repo: comment.repo,
      wordCount: comment.wordCount,
    }));

  const mostCommentedPaths = [...pathStats].slice(0, 25).map((path) => ({
    path: path.path,
    comments: path.comments,
  }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalComments: raw.length,

      positionedComments,

      lineComments,

      totalWords,

      averageWordCount,

      averageCommentAgeDays,

      averageUpdatedDays,

      uniqueRepositories: repoStats.length,

      uniqueAuthors: authorStats.length,

      uniquePaths: pathStats.length,
    },

    repos: repoStats,

    authors: authorStats,

    paths: pathStats,

    commits: commitStats,

    creationTimeline,

    topLongestComments,

    mostCommentedPaths,
  });
}
