import { CommitCommentReactionRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "commit-comment-reactions";

export async function process(): Promise<void> {
  const raw = await loadJson<CommitCommentReactionRecord[]>(
    `data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<string, number>();

  const commentMap = new Map<number, number>();

  const userMap = new Map<string, number>();

  const contentMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let reactionsWithUser = 0;

  const reactionAges: number[] = [];

  const stats = raw.map((reaction) => {
    const createdAt = reaction.created_at
      ? new Date(reaction.created_at)
      : null;

    const createdYear = createdAt !== null ? createdAt.getUTCFullYear() : null;

    const ageDays = createdAt !== null ? daysBetween(createdAt, now) : null;

    if (ageDays !== null) {
      reactionAges.push(ageDays);

      creationYears.set(
        createdYear!,
        (creationYears.get(createdYear!) ?? 0) + 1,
      );
    }

    repoMap.set(reaction.repo, (repoMap.get(reaction.repo) ?? 0) + 1);

    commentMap.set(
      reaction.comment_id,
      (commentMap.get(reaction.comment_id) ?? 0) + 1,
    );

    contentMap.set(
      reaction.content,
      (contentMap.get(reaction.content) ?? 0) + 1,
    );

    if (reaction.user !== null) {
      reactionsWithUser++;

      userMap.set(reaction.user, (userMap.get(reaction.user) ?? 0) + 1);
    }

    return {
      id: reaction.id,

      repo: reaction.repo,

      commentId: reaction.comment_id,

      user: reaction.user,

      content: reaction.content,

      createdYear,

      ageDays,

      hasUser: reaction.user !== null,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, reactions]) => ({
      repo,
      reactions,
    }))
    .sort((a, b) => b.reactions - a.reactions);

  const commentStats = [...commentMap.entries()]
    .map(([commentId, reactions]) => ({
      commentId,
      reactions,
    }))
    .sort((a, b) => b.reactions - a.reactions);

  const userStats = [...userMap.entries()]
    .map(([user, reactions]) => ({
      user,
      reactions,
    }))
    .sort((a, b) => b.reactions - a.reactions);

  const contentStats = [...contentMap.entries()]
    .map(([content, reactions]) => ({
      content,
      reactions,

      share: raw.length > 0 ? reactions / raw.length : 0,
    }))
    .sort((a, b) => b.reactions - a.reactions);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, reactions]) => ({
      year,
      reactions,
    }))
    .sort((a, b) => a.year - b.year);

  const averageReactionAgeDays =
    reactionAges.length > 0
      ? reactionAges.reduce((a, b) => a + b, 0) / reactionAges.length
      : 0;

  const topReactedComments = [...commentStats].slice(0, 25).map((comment) => ({
    commentId: comment.commentId,
    reactions: comment.reactions,
  }));

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    reactions: repo.reactions,
  }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalReactions: raw.length,

      reactionsWithUser,

      anonymousReactions: raw.length - reactionsWithUser,

      averageReactionAgeDays,

      uniqueRepositories: repoStats.length,

      uniqueComments: commentStats.length,

      uniqueUsers: userStats.length,

      uniqueReactionTypes: contentStats.length,
    },

    repos: repoStats,

    comments: commentStats,

    users: userStats,

    reactionTypes: contentStats,

    creationTimeline,

    topReactedComments,

    topRepositories,
  });
}
