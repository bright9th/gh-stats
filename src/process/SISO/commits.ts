import { CommitRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";
import { getWordCount } from "../utils/text.js";

const processName = "commits";

export async function process(): Promise<void> {
  const raw = await loadJson<CommitRecord[]>(`data/raw/${processName}.json`);

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      commits: number;
      comments: number;
      words: number;
    }
  >();

  const authorMap = new Map<
    string,
    {
      commits: number;
      comments: number;
      words: number;
    }
  >();

  const committerMap = new Map<
    string,
    {
      commits: number;
    }
  >();

  const emailDomainMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let totalComments = 0;

  let totalWords = 0;

  const commitAges: number[] = [];

  const wordCounts: number[] = [];

  const commentCounts: number[] = [];

  const stats = raw.map((commit) => {
    const committedAt = commit.committed_at
      ? new Date(commit.committed_at)
      : null;

    const createdYear =
      committedAt !== null ? committedAt.getUTCFullYear() : null;

    const ageDays = committedAt !== null ? daysBetween(committedAt, now) : null;

    const wordCount = getWordCount(commit.message);

    totalComments += commit.comment_count;

    totalWords += wordCount;

    wordCounts.push(wordCount);

    commentCounts.push(commit.comment_count);

    if (ageDays !== null) {
      commitAges.push(ageDays);

      creationYears.set(
        createdYear!,
        (creationYears.get(createdYear!) ?? 0) + 1,
      );
    }

    const repoStats = repoMap.get(commit.repo);

    if (repoStats) {
      repoStats.commits += 1;
      repoStats.comments += commit.comment_count;
      repoStats.words += wordCount;
    } else {
      repoMap.set(commit.repo, {
        commits: 1,
        comments: commit.comment_count,
        words: wordCount,
      });
    }

    if (commit.author_login !== null) {
      const authorStats = authorMap.get(commit.author_login);

      if (authorStats) {
        authorStats.commits += 1;
        authorStats.comments += commit.comment_count;
        authorStats.words += wordCount;
      } else {
        authorMap.set(commit.author_login, {
          commits: 1,
          comments: commit.comment_count,
          words: wordCount,
        });
      }
    }

    if (commit.committer_login !== null) {
      const committerStats = committerMap.get(commit.committer_login);

      if (committerStats) {
        committerStats.commits += 1;
      } else {
        committerMap.set(commit.committer_login, {
          commits: 1,
        });
      }
    }

    if (commit.author_email !== null) {
      const domain =
        commit.author_email.split("@").pop()?.toLowerCase() ?? "unknown";

      emailDomainMap.set(domain, (emailDomainMap.get(domain) ?? 0) + 1);
    }

    return {
      repo: commit.repo,

      sha: commit.sha,

      authorLogin: commit.author_login,

      committerLogin: commit.committer_login,

      authorName: commit.author_name,

      commentCount: commit.comment_count,

      committed: committedAt !== null,

      createdYear,

      ageDays,

      wordCount,

      characterCount: commit.message.length,

      messageLength: commit.message.length,

      hasComments: commit.comment_count > 0,

      isDifferentCommitter: commit.author_login !== commit.committer_login,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      commits: stats.commits,

      comments: stats.comments,

      words: stats.words,

      averageWords: stats.commits > 0 ? stats.words / stats.commits : 0,

      averageComments: stats.commits > 0 ? stats.comments / stats.commits : 0,
    }))
    .sort((a, b) => b.commits - a.commits);

  const authorStats = [...authorMap.entries()]
    .map(([author, stats]) => ({
      author,

      commits: stats.commits,

      comments: stats.comments,

      words: stats.words,

      averageWords: stats.commits > 0 ? stats.words / stats.commits : 0,
    }))
    .sort((a, b) => b.commits - a.commits);

  const committerStats = [...committerMap.entries()]
    .map(([committer, stats]) => ({
      committer,
      commits: stats.commits,
    }))
    .sort((a, b) => b.commits - a.commits);

  const emailDomainStats = [...emailDomainMap.entries()]
    .map(([domain, commits]) => ({
      domain,
      commits,
    }))
    .sort((a, b) => b.commits - a.commits);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, commits]) => ({
      year,
      commits,
    }))
    .sort((a, b) => a.year - b.year);

  const averageCommitAgeDays =
    commitAges.length > 0
      ? commitAges.reduce((a, b) => a + b, 0) / commitAges.length
      : 0;

  const averageWordCount =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

  const averageCommentCount =
    commentCounts.length > 0
      ? commentCounts.reduce((a, b) => a + b, 0) / commentCounts.length
      : 0;

  const longestMessages = [...stats]
    .sort((a, b) => b.characterCount - a.characterCount)
    .slice(0, 25)
    .map((commit) => ({
      sha: commit.sha,
      repo: commit.repo,
      characterCount: commit.characterCount,
    }));

  const mostCommentedCommits = [...stats]
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 25)
    .map((commit) => ({
      sha: commit.sha,
      repo: commit.repo,
      commentCount: commit.commentCount,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalCommits: raw.length,

      totalComments,

      totalWords,

      averageWordCount,

      averageCommentCount,

      averageCommitAgeDays,

      uniqueRepositories: repoStats.length,

      uniqueAuthors: authorStats.length,

      uniqueCommitters: committerStats.length,
    },

    repos: repoStats,

    authors: authorStats,

    committers: committerStats,

    emailDomains: emailDomainStats,

    creationTimeline,

    longestMessages,

    mostCommentedCommits,
  });
}
