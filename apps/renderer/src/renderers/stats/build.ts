import { DISPLAYNAME } from "../../constants";
import { loadDataSISO } from "../../utils/load-data";
import {
  CommitsProcessed,
  PullRequestsProcessed,
  IssuesProcessed,
  ReposProcessed,
  ContributorsProcessed,
} from "@gh-stats/types";
import { GitHubStatsCardData } from "../../types/card-data";

export async function buildCardData(): Promise<GitHubStatsCardData> {
  const commits = await loadDataSISO<CommitsProcessed>("commits");
  const pulls = await loadDataSISO<PullRequestsProcessed>("pull-requests");
  const issues = await loadDataSISO<IssuesProcessed>("issues");
  const repos = await loadDataSISO<ReposProcessed>("repos");
  const contributors =
    await loadDataSISO<ContributorsProcessed>("contributors");

  return {
    displayName: DISPLAYNAME,

    stats: [
      {
        label: "Commits",
        value: commits.overview.totalCommits,
      },
      {
        label: "Pull Requests",
        value: pulls.overview.totalPullRequests,
      },
      {
        label: "Issues",
        value: issues.overview.totalIssues,
      },
      {
        label: "Stars",
        value: repos.overview.totalStars,
      },
      {
        label: "Repositories",
        value: repos.overview.totalRepos,
      },
      {
        label: "Contributions",
        value: contributors.overview.totalContributions,
      },
    ],
  };
}
