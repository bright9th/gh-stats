import { PullRequestReviewRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";
import { getWordCount } from "../utils/text.js";

const processName = "pull-request-reviews";

export async function process(): Promise<void> {
  const raw = await loadJson<PullRequestReviewRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      reviews: number;
      words: number;
    }
  >();

  const authorMap = new Map<
    string,
    {
      reviews: number;
      words: number;
    }
  >();

  const stateMap = new Map<string, number>();

  const pullRequestMap = new Map<number, number>();

  const commitMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let submittedReviews = 0;

  let pendingReviews = 0;

  let totalWords = 0;

  const reviewAges: number[] = [];

  const wordCounts: number[] = [];

  const stats = raw.map((review) => {
    const submittedAt = review.submitted_at
      ? new Date(review.submitted_at)
      : null;

    const createdYear =
      submittedAt !== null ? submittedAt.getUTCFullYear() : null;

    const ageDays = submittedAt !== null ? daysBetween(submittedAt, now) : null;

    const wordCount = getWordCount(review.body);

    wordCounts.push(wordCount);

    totalWords += wordCount;

    if (ageDays !== null) {
      reviewAges.push(ageDays);
    }

    if (submittedAt !== null) {
      submittedReviews++;

      creationYears.set(
        createdYear!,
        (creationYears.get(createdYear!) ?? 0) + 1,
      );
    } else {
      pendingReviews++;
    }

    stateMap.set(review.state, (stateMap.get(review.state) ?? 0) + 1);

    const repoStats = repoMap.get(review.repo);

    if (repoStats) {
      repoStats.reviews += 1;
      repoStats.words += wordCount;
    } else {
      repoMap.set(review.repo, {
        reviews: 1,
        words: wordCount,
      });
    }

    if (review.author !== null) {
      const authorStats = authorMap.get(review.author);

      if (authorStats) {
        authorStats.reviews += 1;
        authorStats.words += wordCount;
      } else {
        authorMap.set(review.author, {
          reviews: 1,
          words: wordCount,
        });
      }
    }

    pullRequestMap.set(
      review.pull_number,
      (pullRequestMap.get(review.pull_number) ?? 0) + 1,
    );

    commitMap.set(review.commit_id, (commitMap.get(review.commit_id) ?? 0) + 1);

    return {
      id: review.id,

      repo: review.repo,

      pullNumber: review.pull_number,

      author: review.author,

      state: review.state,

      commitId: review.commit_id,

      submitted: submittedAt !== null,

      createdYear,

      ageDays,

      wordCount,

      characterCount: review.body.length,

      hasBody: review.body.trim().length > 0,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      reviews: stats.reviews,

      words: stats.words,

      averageWords: stats.reviews > 0 ? stats.words / stats.reviews : 0,
    }))
    .sort((a, b) => b.reviews - a.reviews);

  const authorStats = [...authorMap.entries()]
    .map(([author, stats]) => ({
      author,

      reviews: stats.reviews,

      words: stats.words,

      averageWords: stats.reviews > 0 ? stats.words / stats.reviews : 0,
    }))
    .sort((a, b) => b.reviews - a.reviews);

  const stateStats = [...stateMap.entries()]
    .map(([state, count]) => ({
      state,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const pullRequestStats = [...pullRequestMap.entries()]
    .map(([pullNumber, reviews]) => ({
      pullNumber,
      reviews,
    }))
    .sort((a, b) => b.reviews - a.reviews);

  const commitStats = [...commitMap.entries()]
    .map(([commitId, reviews]) => ({
      commitId,
      reviews,
    }))
    .sort((a, b) => b.reviews - a.reviews);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, reviews]) => ({
      year,
      reviews,
    }))
    .sort((a, b) => a.year - b.year);

  const averageReviewAgeDays =
    reviewAges.length > 0
      ? reviewAges.reduce((a, b) => a + b, 0) / reviewAges.length
      : 0;

  const averageWordCount =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

  const topLongestReviews = [...stats]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 25)
    .map((review) => ({
      id: review.id,
      repo: review.repo,
      wordCount: review.wordCount,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalReviews: raw.length,

      submittedReviews,

      pendingReviews,

      totalWords,

      averageWordCount,

      averageReviewAgeDays,
    },

    repos: repoStats,

    authors: authorStats,

    states: stateStats,

    pullRequests: pullRequestStats,

    commits: commitStats,

    creationTimeline,

    topLongestReviews,
  });
}
