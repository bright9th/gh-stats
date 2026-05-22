export interface RepoRecord {
  id: number;
  node_id: string;

  owner: string;
  name: string;
  full_name: string;

  private: boolean;
  archived: boolean;

  description: string | null;
  language: string | null;

  stargazers_count: number;
  forks_count: number;

  created_at: string;
  updated_at: string;
  pushed_at: string | null;

  html_url: string;
}

export type StarRecord = RepoRecord;

type UserRecord = {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
  html_url: string;
};
export type FollowerRecord = UserRecord;
export type FollowingRecord = UserRecord;

export type IssueRecord = {
  id: number;
  number: number;

  repo: string;

  title: string;

  state: string;

  author: string | null;

  assignees: string[];

  labels: string[];

  comments: number;

  created_at: string;
  updated_at: string;
  closed_at: string | null;

  html_url: string;
};
export type PullRequestRecord = IssueRecord & {
  pull_request_url: string;
};

export type OrganizationRecord = {
  id: number;

  login: string;

  node_id: string;

  avatar_url: string;

  description: string | null;

  url: string;

  repos_url: string;

  events_url: string;

  hooks_url: string;
};

export type GistFileRecord = {
  filename: string;

  language: string | null;

  type: string | null;

  size: number | null;

  raw_url: string;
};
export type GistRecord = {
  id: string;
  node_id: string;

  description: string | null;

  public: boolean;

  created_at: string;
  updated_at: string;

  comments: number;

  html_url: string;

  files: GistFileRecord[];
};

export type ReleaseRecord = {
  id: number;

  repo: string;

  tag_name: string;

  name: string | null;

  body: string | null;

  draft: boolean;

  prerelease: boolean;

  created_at: string;
  published_at: string | null;

  author: string | null;

  html_url: string;
};

export type WorkflowRunRecord = {
  id: number;

  repo: string;

  name: string | null;

  workflow_id: number;

  head_branch: string | null;

  head_sha: string;

  event: string;

  status: string | null;

  conclusion: string | null;

  run_number: number;

  actor: string | null;

  created_at: string;
  updated_at: string;

  html_url: string;
};

export type IssueCommentRecord = {
  id: number;

  repo: string;

  issue_url: string;

  author: string | null;

  body: string;

  created_at: string;

  updated_at: string;

  html_url: string;

  reactions: {
    total_count: number;
  };
};

export type PullRequestReviewRecord = {
  id: number;

  repo: string;

  pull_number: number;

  author: string | null;

  state: string;

  body: string;

  submitted_at: string | null;

  commit_id: string;

  html_url: string;
};

export type PullRequestReviewCommentRecord = {
  id: number;

  repo: string;

  pull_number: number;

  author: string | null;

  body: string;

  path: string | null;

  position: number | null;

  commit_id: string;

  created_at: string;

  updated_at: string;

  html_url: string;
};

export type ContributorRecord = {
  repo: string;

  id: number;

  login: string;

  node_id: string;

  avatar_url: string;

  html_url: string;

  contributions: number;

  type: string;
};

export type LanguageRecord = {
  repo: string;

  language: string;

  bytes: number;
};

export type BranchRecord = {
  repo: string;

  name: string;

  protected: boolean;

  commit_sha: string;

  commit_url: string;
};

export type CommitRecord = {
  repo: string;

  sha: string;

  author_login: string | null;

  committer_login: string | null;

  author_name: string | null;

  author_email: string | null;

  message: string;

  comment_count: number;

  committed_at: string | null;

  html_url: string;
};

export type TagRecord = {
  repo: string;

  name: string;

  commit_sha: string;

  commit_url: string;

  zipball_url: string;

  tarball_url: string;

  node_id: string;
};

export type DeploymentRecord = {
  id: number;

  repo: string;

  sha: string;

  ref: string;

  task: string;

  environment: string | null;

  creator: string | null;

  description: string | null;

  created_at: string;

  updated_at: string;

  statuses_url: string;

  repository_url: string;
};

export type MilestoneRecord = {
  id: number;

  repo: string;

  number: number;

  title: string;

  description: string | null;

  state: string;

  open_issues: number;

  closed_issues: number;

  creator: string | null;

  created_at: string;

  updated_at: string;

  closed_at: string | null;

  due_on: string | null;

  html_url: string;
};

export type CommitCommentRecord = {
  id: number;

  repo: string;

  commit_id: string;

  path: string | null;

  position: number | null;

  line: number | null;

  author: string | null;

  body: string;

  created_at: string;

  updated_at: string;

  html_url: string;
};

export type EnvironmentRecord = {
  repo: string;

  id: number;

  name: string;

  html_url: string;

  created_at: string;

  updated_at: string;

  protection_rules_count: number;
};

export type IssueCommentReactionRecord = {
  id: number;

  comment_id: number;

  user: string | null;

  content: string;

  created_at: string | null;
};

export type IssueReactionRecord = {
  id: number;

  repo: string;

  issue_number: number;

  user: string | null;

  content: string;

  created_at: string | null;
};

export type PullRequestReviewCommentReactionRecord = {
  id: number;

  repo: string;

  comment_id: number;

  user: string | null;

  content: string;

  created_at: string | null;
};

export type CommitCommentReactionRecord = {
  id: number;

  repo: string;

  comment_id: number;

  user: string | null;

  content: string;

  created_at: string | null;
};

export type LabelRecord = {
  id: number;

  repo: string;

  name: string;

  color: string;

  description: string | null;

  is_default: boolean;
};

export type CommitStatRecord = {
  repo: string;

  sha: string;

  additions: number;

  deletions: number;

  changes: number;

  changed_files: number;

  filename: string;

  status: string;

  file_additions: number;

  file_deletions: number;

  file_changes: number;
};

export type CheckRunRecord = {
  id: number;

  repo: string;

  sha: string;

  name: string;

  status: string;

  conclusion: string | null;

  started_at: string | null;

  completed_at: string | null;

  html_url: string;

  details_url: string | null;

  app: string | null;

  external_id: string | null;
};
