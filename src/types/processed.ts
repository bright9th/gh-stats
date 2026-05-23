export type BranchesProcessed = {
  stats: {
    repo: string;
    name: string;
    protected: boolean;
    commitSha: string;
    commitUrl: string;
    isDefaultLike: boolean;
    nameLength: number;
  }[];

  overview: {
    totalBranches: number;
    protectedBranches: number;
    unprotectedBranches: number;
    protectionRate: number;
    uniqueRepositories: number;
    uniqueBranchNames: number;
  };

  repos: {
    repo: string;
    branches: number;
    protectedBranches: number;
    protectedRate: number;
  }[];

  branchNames: {
    name: string;
    count: number;
  }[];

  commits: {
    commitSha: string;
    branches: number;
  }[];

  topRepositories: {
    repo: string;
    branches: number;
    protectedBranches: number;
  }[];

  topBranchNames: {
    name: string;
    count: number;
  }[];

  sharedCommitBranches: {
    commitSha: string;
    branches: number;
  }[];
};

export type CheckRunsProcessed = {
  stats: {
    id: number;
    repo: string;
    sha: string;
    name: string;
    status: string;
    conclusion: string | null;
    app: string | null;
    durationMinutes: number | null;
    ageDays: number | null;
    createdYear: number | null;
    hasDetailsUrl: boolean;
    hasExternalId: boolean;
    isCompleted: boolean;
    isSuccessful: boolean;
    isFailed: boolean;
  }[];

  overview: {
    totalRuns: number;
    completedRuns: number;
    successfulRuns: number;
    failedRuns: number;
    runsWithDetailsUrl: number;
    runsWithExternalId: number;
    averageDurationMinutes: number;
    averageAgeDays: number;
    uniqueRepositories: number;
    uniqueApps: number;
    uniqueCheckNames: number;
  };

  repos: {
    repo: string;
    runs: number;
    completed: number;
    successful: number;
    completionRate: number;
    successRate: number;
  }[];

  apps: {
    app: string;
    runs: number;
  }[];

  statuses: {
    status: string;
    runs: number;
  }[];

  conclusions: {
    conclusion: string;
    runs: number;
  }[];

  checkNames: {
    name: string;
    runs: number;
  }[];

  shas: {
    sha: string;
    runs: number;
  }[];

  creationTimeline: {
    year: number;
    runs: number;
  }[];

  longestRuns: {
    id: number;
    repo: string;
    name: string;
    durationMinutes: number | null;
  }[];

  mostExecutedChecks: {
    name: string;
    runs: number;
  }[];
};

export type CommitCommentReactionsProcessed = {
  stats: {
    id: number;
    repo: string;
    commentId: number;
    user: string | null;
    content: string;
    createdYear: number | null;
    ageDays: number | null;
    hasUser: boolean;
  }[];

  overview: {
    totalReactions: number;
    reactionsWithUser: number;
    anonymousReactions: number;
    averageReactionAgeDays: number;
    uniqueRepositories: number;
    uniqueComments: number;
    uniqueUsers: number;
    uniqueReactionTypes: number;
  };

  repos: {
    repo: string;
    reactions: number;
  }[];

  comments: {
    commentId: number;
    reactions: number;
  }[];

  users: {
    user: string;
    reactions: number;
  }[];

  reactionTypes: {
    content: string;
    reactions: number;
    share: number;
  }[];

  creationTimeline: {
    year: number;
    reactions: number;
  }[];

  topReactedComments: {
    commentId: number;
    reactions: number;
  }[];

  topRepositories: {
    repo: string;
    reactions: number;
  }[];
};

export type CommitCommentsProcessed = {
  stats: {
    id: number;
    repo: string;
    commitId: string;
    author: string | null;
    path: string | null;
    position: number | null;
    line: number | null;
    wordCount: number;
    characterCount: number;
    createdYear: number;
    ageDays: number;
    updatedDaysAgo: number;
    hasPath: boolean;
    hasPosition: boolean;
    hasLine: boolean;
    isEdited: boolean;
  }[];

  overview: {
    totalComments: number;
    positionedComments: number;
    lineComments: number;
    totalWords: number;
    averageWordCount: number;
    averageCommentAgeDays: number;
    averageUpdatedDays: number;
    uniqueRepositories: number;
    uniqueAuthors: number;
    uniquePaths: number;
  };

  repos: {
    repo: string;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  authors: {
    author: string;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  paths: {
    path: string;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  commits: {
    commitId: string;
    comments: number;
  }[];

  creationTimeline: {
    year: number;
    comments: number;
  }[];

  topLongestComments: {
    id: number;
    repo: string;
    wordCount: number;
  }[];

  mostCommentedPaths: {
    path: string;
    comments: number;
  }[];
};

export type CommitStatsProcessed = {
  stats: {
    repo: string;
    sha: string;
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    changedFiles: number;
    extension: string;
    filenameLength: number;
    netChanges: number;
    isBinary: boolean;
  }[];

  overview: {
    totalRecords: number;
    totalAdditions: number;
    totalDeletions: number;
    totalChanges: number;
    totalFiles: number;
    netChanges: number;
    uniqueRepositories: number;
    uniqueCommits: number;
    uniqueFiles: number;
    uniqueExtensions: number;
  };

  repos: {
    repo: string;
    commits: number;
    files: number;
    additions: number;
    deletions: number;
    changes: number;
    averageChangesPerFile: number;
  }[];

  commits: {
    sha: string;
    repo: string;
    files: number;
    additions: number;
    deletions: number;
    changes: number;
    netChanges: number;
  }[];

  files: {
    filename: string;
    commits: number;
    additions: number;
    deletions: number;
    changes: number;
  }[];

  statuses: {
    status: string;
    count: number;
  }[];

  extensions: {
    extension: string;
    files: number;
    changes: number;
    averageChanges: number;
  }[];

  topRepositories: {
    repo: string;
    changes: number;
    files: number;
  }[];

  largestCommits: {
    sha: string;
    repo: string;
    changes: number;
    files: number;
  }[];

  mostChangedFiles: {
    filename: string;
    changes: number;
    commits: number;
  }[];
};

export type CommitsProcessed = {
  stats: {
    repo: string;
    sha: string;
    authorLogin: string | null;
    committerLogin: string | null;
    authorName: string | null;
    commentCount: number;
    committed: boolean;
    createdYear: number | null;
    ageDays: number | null;
    wordCount: number;
    characterCount: number;
    messageLength: number;
    hasComments: boolean;
    isDifferentCommitter: boolean;
  }[];

  overview: {
    totalCommits: number;
    totalComments: number;
    totalWords: number;
    averageWordCount: number;
    averageCommentCount: number;
    averageCommitAgeDays: number;
    uniqueRepositories: number;
    uniqueAuthors: number;
    uniqueCommitters: number;
  };

  repos: {
    repo: string;
    commits: number;
    comments: number;
    words: number;
    averageWords: number;
    averageComments: number;
  }[];

  authors: {
    author: string;
    commits: number;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  committers: {
    committer: string;
    commits: number;
  }[];

  emailDomains: {
    domain: string;
    commits: number;
  }[];

  creationTimeline: {
    year: number;
    commits: number;
  }[];

  longestMessages: {
    sha: string;
    repo: string;
    characterCount: number;
  }[];

  mostCommentedCommits: {
    sha: string;
    repo: string;
    commentCount: number;
  }[];
};

export type ContributorsProcessed = {
  stats: {
    repo: string;
    login: string;
    type: string;
    contributions: number;
    avatarUrl: string;
    htmlUrl: string;
    isBot: boolean;
  }[];

  overview: {
    totalContributorEntries: number;
    uniqueContributors: number;
    uniqueRepositories: number;
    totalContributions: number;
    averageContributions: number;
  };

  repos: {
    repo: string;
    contributors: number;
    contributions: number;
    averageContributions: number;
  }[];

  contributors: {
    login: string;
    repos: number;
    contributions: number;
    type: string;
    averageContributionsPerRepo: number;
  }[];

  types: {
    type: string;
    count: number;
  }[];

  topContributors: {
    login: string;
    contributions: number;
    repos: number;
  }[];

  topRepositories: {
    repo: string;
    contributions: number;
    contributors: number;
  }[];
};

export type DeploymentsProcessed = {
  stats: {
    id: number;
    repo: string;
    sha: string;
    ref: string;
    task: string;
    environment: string | null;
    creator: string | null;
    createdYear: number;
    ageDays: number;
    updateDurationMinutes: number;
    descriptionLength: number;
    hasEnvironment: boolean;
    hasDescription: boolean;
  }[];

  overview: {
    totalDeployments: number;
    deploymentsWithEnvironment: number;
    deploymentsWithDescription: number;
    averageDeploymentAgeDays: number;
    averageUpdateDurationMinutes: number;
    uniqueRepositories: number;
    uniqueEnvironments: number;
    uniqueCreators: number;
  };

  repos: {
    repo: string;
    deployments: number;
  }[];

  environments: {
    environment: string;
    deployments: number;
  }[];

  creators: {
    creator: string;
    deployments: number;
  }[];

  tasks: {
    task: string;
    deployments: number;
  }[];

  refs: {
    ref: string;
    deployments: number;
  }[];

  shas: {
    sha: string;
    deployments: number;
  }[];

  creationTimeline: {
    year: number;
    deployments: number;
  }[];

  longestDeployments: {
    id: number;
    repo: string;
    durationMinutes: number;
  }[];

  longestDescriptions: {
    id: number;
    repo: string;
    descriptionLength: number;
  }[];
};

export type EnvironmentsProcessed = {
  stats: {
    repo: string;
    id: number;
    name: string;
    protectionRules: number;
    createdYear: number;
    ageDays: number;
    updateDurationDays: number;
    isProtected: boolean;
    nameLength: number;
  }[];

  overview: {
    totalEnvironments: number;
    protectedEnvironments: number;
    unprotectedEnvironments: number;
    totalProtectionRules: number;
    averageEnvironmentAgeDays: number;
    averageUpdateDurationDays: number;
    uniqueRepositories: number;
    uniqueEnvironmentNames: number;
  };

  repos: {
    repo: string;
    environments: number;
    protectionRules: number;
    averageProtectionRules: number;
  }[];

  environmentNames: {
    name: string;
    count: number;
  }[];

  creationTimeline: {
    year: number;
    environments: number;
  }[];

  topRepositories: {
    repo: string;
    environments: number;
    protectionRules: number;
  }[];

  mostProtectedEnvironments: {
    repo: string;
    name: string;
    protectionRules: number;
  }[];
};

export type FollowersProcessed = {
  stats: {
    id: number;
    login: string;
    profileUrl: string;
    avatarUrl: string;
    loginLength: number;
    startingCharacter: string;
  }[];

  overview: {
    totalFollowers: number;
    averageLoginLength: number;
  };

  loginLengthDistribution: Record<number, number>;

  startingCharacterDistribution: {
    character: string;
    count: number;
  }[];

  topLongestLogins: {
    login: string;
    loginLength: number;
  }[];
};

export type FollowingProcessed = {
  stats: {
    id: number;
    login: string;
    profileUrl: string;
    avatarUrl: string;
    loginLength: number;
    startingCharacter: string;
  }[];

  overview: {
    totalFollowing: number;
    averageLoginLength: number;
  };

  loginLengthDistribution: Record<number, number>;

  startingCharacterDistribution: {
    character: string;
    count: number;
  }[];

  topLongestLogins: {
    login: string;
    loginLength: number;
  }[];
};

export type GistsProcessed = {
  stats: {
    id: string;
    description: string | null;
    public: boolean;
    comments: number;
    createdYear: number;
    ageDays: number;
    updatedDaysAgo: number;
    fileCount: number;
    totalSize: number;
    hasDescription: boolean;
    languages: string[];
    files: {
      filename: string;
      language: string | null;
      type: string | null;
      size: number | null;
      rawUrl: string;
    }[];
  }[];

  overview: {
    totalGists: number;
    publicGists: number;
    privateGists: number;
    totalComments: number;
    totalFiles: number;
    totalFileSize: number;
    averageComments: number;
    averageFilesPerGist: number;
    averageFileSize: number;
    averageGistAgeDays: number;
    averageUpdatedDays: number;
  };

  languages: {
    language: string;
    gists: number;
    files: number;
    totalSize: number;
    averageFileSize: number;
  }[];

  fileTypes: {
    type: string;
    count: number;
  }[];

  creationTimeline: {
    year: number;
    gists: number;
  }[];

  topCommentedGists: {
    id: string;
    comments: number;
    fileCount: number;
  }[];

  largestGists: {
    id: string;
    totalSize: number;
    fileCount: number;
  }[];
};

export type IssueCommentReactionsProcessed = {
  stats: {
    id: number;
    commentId: number;
    user: string | null;
    content: string;
    createdYear: number | null;
    ageDays: number | null;
    hasUser: boolean;
  }[];

  overview: {
    totalReactions: number;
    reactionsWithUser: number;
    anonymousReactions: number;
    averageReactionAgeDays: number;
    uniqueComments: number;
    uniqueUsers: number;
    uniqueReactionTypes: number;
  };

  comments: {
    commentId: number;
    reactions: number;
  }[];

  users: {
    user: string;
    reactions: number;
  }[];

  reactionTypes: {
    content: string;
    reactions: number;
    share: number;
  }[];

  creationTimeline: {
    year: number;
    reactions: number;
  }[];

  topReactedComments: {
    commentId: number;
    reactions: number;
  }[];

  topReactionUsers: {
    user: string;
    reactions: number;
  }[];
};

export type IssueCommentsProcessed = {
  stats: {
    id: number;
    repo: string;
    issueUrl: string;
    author: string | null;
    reactionCount: number;
    wordCount: number;
    characterCount: number;
    createdYear: number;
    ageDays: number;
    updatedDaysAgo: number;
    hasReactions: boolean;
    isEdited: boolean;
  }[];

  overview: {
    totalComments: number;
    totalReactions: number;
    totalWords: number;
    averageReactions: number;
    averageWordCount: number;
    averageCommentAgeDays: number;
    averageUpdatedDays: number;
  };

  repos: {
    repo: string;
    comments: number;
    reactions: number;
    words: number;
    averageWords: number;
    averageReactions: number;
  }[];

  authors: {
    author: string;
    comments: number;
    reactions: number;
    words: number;
    averageWords: number;
    averageReactions: number;
  }[];

  issues: {
    issueId: number;
    comments: number;
  }[];

  creationTimeline: {
    year: number;
    comments: number;
  }[];

  topReactedComments: {
    id: number;
    repo: string;
    reactionCount: number;
  }[];

  longestComments: {
    id: number;
    repo: string;
    wordCount: number;
  }[];
};

export type IssueReactionsProcessed = {
  stats: {
    id: number;
    repo: string;
    issueNumber: number;
    issueKey: string;
    user: string | null;
    content: string;
    createdYear: number | null;
    ageDays: number | null;
    hasUser: boolean;
  }[];

  overview: {
    totalReactions: number;
    reactionsWithUser: number;
    anonymousReactions: number;
    averageReactionAgeDays: number;
    uniqueRepositories: number;
    uniqueIssues: number;
    uniqueUsers: number;
    uniqueReactionTypes: number;
  };

  repos: {
    repo: string;
    reactions: number;
  }[];

  issues: {
    issueKey: string;
    reactions: number;
  }[];

  users: {
    user: string;
    reactions: number;
  }[];

  reactionTypes: {
    content: string;
    reactions: number;
    share: number;
  }[];

  creationTimeline: {
    year: number;
    reactions: number;
  }[];

  topReactedIssues: {
    issueKey: string;
    reactions: number;
  }[];

  topRepositories: {
    repo: string;
    reactions: number;
  }[];
};

export type IssuesProcessed = {
  stats: {
    id: number;
    repo: string;
    number: number;
    title: string;
    state: string;
    author: string | null;
    assignees: string[];
    labels: string[];
    comments: number;
    createdYear: number;
    ageDays: number;
    updatedDaysAgo: number;
    lifespanDays: number | null;
    isClosed: boolean;
    hasComments: boolean;
    labelCount: number;
    assigneeCount: number;
  }[];

  overview: {
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    totalComments: number;
    averageComments: number;
    averageLifespanDays: number;
    averageUpdatedDays: number;
    closureRate: number;
  };

  repos: {
    repo: string;
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    totalComments: number;
    averageComments: number;
    closureRate: number;
  }[];

  labels: {
    label: string;
    count: number;
  }[];

  assignees: {
    assignee: string;
    count: number;
  }[];

  authors: {
    author: string;
    count: number;
  }[];

  creationTimeline: {
    year: number;
    issues: number;
  }[];

  topCommentedIssues: {
    repo: string;
    number: number;
    title: string;
    comments: number;
  }[];
};

export type LabelsProcessed = {
  stats: {
    id: number;
    repo: string;
    name: string;
    color: string;
    descriptionLength: number;
    hasDescription: boolean;
    isDefault: boolean;
    isDarkColor: boolean;
    nameLength: number;
  }[];

  overview: {
    totalLabels: number;
    defaultLabels: number;
    customLabels: number;
    labelsWithDescription: number;
    averageDescriptionLength: number;
    uniqueRepositories: number;
    uniqueNames: number;
    uniqueColors: number;
  };

  repos: {
    repo: string;
    labels: number;
    defaultLabels: number;
    customLabels: number;
    defaultRate: number;
  }[];

  names: {
    name: string;
    count: number;
  }[];

  colors: {
    color: string;
    count: number;
    isDarkColor: boolean;
  }[];

  topRepositories: {
    repo: string;
    labels: number;
    customLabels: number;
  }[];

  topLabelNames: {
    name: string;
    count: number;
  }[];

  longestDescriptions: {
    repo: string;
    name: string;
    descriptionLength: number;
  }[];
};

export type LanguagesProcessed = {
  stats: {
    repo: string;
    language: string;
    bytes: number;
  }[];

  overview: {
    totalLanguageEntries: number;
    uniqueLanguages: number;
    uniqueRepositories: number;
    totalBytes: number;
    averageBytes: number;
  };

  repos: {
    repo: string;
    totalBytes: number;
    languages: number;
    averageBytesPerLanguage: number;
  }[];

  languages: {
    language: string;
    repos: number;
    bytes: number;
    byteShare: number;
    averageBytesPerRepo: number;
  }[];

  topLanguages: {
    language: string;
    bytes: number;
    repos: number;
    byteShare: number;
  }[];

  topRepositories: {
    repo: string;
    totalBytes: number;
    languages: number;
  }[];
};

export type MilestonesProcessed = {
  stats: {
    id: number;
    repo: string;
    number: number;
    title: string;
    state: string;
    creator: string | null;
    openIssues: number;
    closedIssues: number;
    totalIssues: number;
    completionRate: number;
    createdYear: number;
    ageDays: number;
    closureDurationDays: number | null;
    dueInDays: number | null;
    descriptionLength: number;
    hasDescription: boolean;
    hasDueDate: boolean;
    isOverdue: boolean;
  }[];

  overview: {
    totalMilestones: number;
    openMilestones: number;
    closedMilestones: number;
    totalOpenIssues: number;
    totalClosedIssues: number;
    averageMilestoneAgeDays: number;
    averageClosureDurationDays: number;
    averageCompletionRate: number;
    uniqueRepositories: number;
    uniqueCreators: number;
  };

  repos: {
    repo: string;
    milestones: number;
    openMilestones: number;
    closedMilestones: number;
    totalIssues: number;
    closureRate: number;
  }[];

  creators: {
    creator: string;
    milestones: number;
  }[];

  states: {
    state: string;
    milestones: number;
  }[];

  creationTimeline: {
    year: number;
    milestones: number;
  }[];

  topLargestMilestones: {
    repo: string;
    title: string;
    totalIssues: number;
    completionRate: number;
  }[];

  overdueMilestones: {
    repo: string;
    title: string;
    dueInDays: number | null;
  }[];
};

export type OrganizationsProcessed = {
  stats: {
    id: number;
    login: string;
    avatarUrl: string;
    description: string | null;
    url: string;
    reposUrl: string;
    eventsUrl: string;
    hooksUrl: string;
    loginLength: number;
    descriptionLength: number;
    hasDescription: boolean;
    startingCharacter: string;
  }[];

  overview: {
    totalOrganizations: number;
    organizationsWithDescription: number;
    averageLoginLength: number;
    averageDescriptionLength: number;
  };

  loginLengthDistribution: Record<number, number>;

  startingCharacterDistribution: {
    character: string;
    count: number;
  }[];

  topLongestLogins: {
    login: string;
    loginLength: number;
  }[];

  topLongestDescriptions: {
    login: string;
    descriptionLength: number;
  }[];
};

export type PullRequestReviewCommentReactionsProcessed = {
  stats: {
    id: string | number;
    repo: string;
    commentId: number;
    user: string | null;
    content: string;
    createdYear: number | null;
    ageDays: number | null;
    hasUser: boolean;
  }[];

  overview: {
    totalReactions: number;
    reactionsWithUser: number;
    anonymousReactions: number;
    averageReactionAgeDays: number;
    uniqueRepositories: number;
    uniqueComments: number;
    uniqueUsers: number;
    uniqueReactionTypes: number;
  };

  repos: {
    repo: string;
    reactions: number;
  }[];

  comments: {
    commentId: number;
    reactions: number;
  }[];

  users: {
    user: string;
    reactions: number;
  }[];

  reactionTypes: {
    content: string;
    reactions: number;
    share: number;
  }[];

  creationTimeline: {
    year: number;
    reactions: number;
  }[];

  topReactedComments: {
    commentId: number;
    reactions: number;
  }[];

  topRepositories: {
    repo: string;
    reactions: number;
  }[];
};

export type PullRequestReviewCommentsProcessed = {
  stats: {
    id: string | number;
    repo: string;
    pullNumber: number;
    author: string | null;
    path: string | null;
    position: number | null;
    commitId: string;
    wordCount: number;
    characterCount: number;
    createdYear: number;
    ageDays: number;
    updatedDaysAgo: number;
    hasPath: boolean;
    hasPosition: boolean;
    isEdited: boolean;
  }[];

  overview: {
    totalComments: number;
    positionedComments: number;
    totalWords: number;
    averageWordCount: number;
    averageCommentAgeDays: number;
    averageUpdatedDays: number;
  };

  repos: {
    repo: string;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  authors: {
    author: string;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  paths: {
    path: string;
    comments: number;
    words: number;
    averageWords: number;
  }[];

  pullRequests: {
    pullNumber: number;
    comments: number;
  }[];

  commits: {
    commitId: string;
    comments: number;
  }[];

  creationTimeline: {
    year: number;
    comments: number;
  }[];

  topLongestComments: {
    id: string | number;
    repo: string;
    wordCount: number;
  }[];

  mostCommentedPaths: {
    path: string;
    comments: number;
  }[];
};

export type PullRequestReviewsProcessed = {
  stats: {
    id: string | number;
    repo: string;
    pullNumber: number;
    author: string | null;
    state: string;
    commitId: string;
    submitted: boolean;
    createdYear: number | null;
    ageDays: number | null;
    wordCount: number;
    characterCount: number;
    hasBody: boolean;
  }[];

  overview: {
    totalReviews: number;
    submittedReviews: number;
    pendingReviews: number;
    totalWords: number;
    averageWordCount: number;
    averageReviewAgeDays: number;
  };

  repos: {
    repo: string;
    reviews: number;
    words: number;
    averageWords: number;
  }[];

  authors: {
    author: string;
    reviews: number;
    words: number;
    averageWords: number;
  }[];

  states: {
    state: string;
    count: number;
  }[];

  pullRequests: {
    pullNumber: number;
    reviews: number;
  }[];

  commits: {
    commitId: string;
    reviews: number;
  }[];

  creationTimeline: {
    year: number;
    reviews: number;
  }[];

  topLongestReviews: {
    id: string | number;
    repo: string;
    wordCount: number;
  }[];
};

export type PullRequestsProcessed = {
  stats: {
    id: string | number;
    repo: string;
    number: number;
    title: string;
    state: string;
    author: string | null;
    assignees: string[];
    labels: string[];
    comments: number;
    pullRequestUrl: string;
    createdYear: number;
    ageDays: number;
    updatedDaysAgo: number;
    lifespanDays: number | null;
    isClosed: boolean;
    hasComments: boolean;
    labelCount: number;
    assigneeCount: number;
  }[];

  overview: {
    totalPullRequests: number;
    openPullRequests: number;
    closedPullRequests: number;
    totalComments: number;
    averageComments: number;
    averageLifespanDays: number;
    averageUpdatedDays: number;
    closureRate: number;
  };

  repos: {
    repo: string;
    totalPullRequests: number;
    openPullRequests: number;
    closedPullRequests: number;
    totalComments: number;
    averageComments: number;
    closureRate: number;
  }[];

  labels: {
    label: string;
    count: number;
  }[];

  assignees: {
    assignee: string;
    count: number;
  }[];

  authors: {
    author: string;
    count: number;
  }[];

  creationTimeline: {
    year: number;
    pullRequests: number;
  }[];

  topCommentedPullRequests: {
    repo: string;
    number: number;
    title: string;
    comments: number;
  }[];
};

export type ReleasesProcessed = {
  stats: {
    id: string | number;
    repo: string;
    tagName: string;
    name: string | null;
    author: string | null;
    draft: boolean;
    prerelease: boolean;
    published: boolean;
    createdYear: number;
    ageDays: number;
    publishDelayDays: number | null;
    versionType: "major" | "minor" | "patch" | "other";
    bodyLength: number;
    hasBody: boolean;
  }[];

  overview: {
    totalReleases: number;
    drafts: number;
    prereleases: number;
    published: number;
    averageReleaseAgeDays: number;
    averagePublishDelayDays: number;
    publishRate: number;
  };

  repos: {
    repo: string;
    totalReleases: number;
    drafts: number;
    prereleases: number;
    published: number;
    publishRate: number;
  }[];

  authors: {
    author: string;
    releases: number;
  }[];

  versionTypes: {
    versionType: string;
    count: number;
  }[];

  creationTimeline: {
    year: number;
    releases: number;
  }[];

  topLongestReleaseNotes: {
    repo: string;
    tagName: string;
    bodyLength: number;
  }[];
};

export type ReposProcessed = {
  stats: {
    repo: string;
    owner: string;
    language: string | null;
    archived: boolean;
    private: boolean;
    stars: number;
    forks: number;
    starForkRatio: number | null;
    ageDays: number;
    updatedDaysAgo: number;
    pushedDaysAgo: number | null;
    createdYear: number;
    hasDescription: boolean;
    isStale: boolean;
  }[];

  overview: {
    totalRepos: number;
    activeRepos: number;
    archivedRepos: number;
    totalStars: number;
    totalForks: number;
    averageStars: number;
    averageForks: number;
    averageRepoAgeDays: number;
    averageUpdatedDays: number;
    averagePushDays: number;
  };

  languages: {
    language: string;
    repos: number;
    stars: number;
    forks: number;
    averageStars: number;
    averageForks: number;
  }[];

  topStarred: {
    repo: string;
    stars: number;
  }[];

  topForked: {
    repo: string;
    forks: number;
  }[];

  creationTimeline: {
    year: number;
    repos: number;
  }[];
};

export type StarsProcessed = {
  stats: {
    repo: string;
    owner: string;
    language: string | null;
    archived: boolean;
    stars: number;
    forks: number;
    starForkRatio: number | null;
    ageDays: number;
    pushedDaysAgo: number | null;
    createdYear: number;
    popularityScore: number;
    activityScore: number;
  }[];

  overview: {
    totalStarredRepos: number;
    archivedRepos: number;
    activeRepos: number;
    totalRepoStars: number;
    totalRepoForks: number;
    averageRepoStars: number;
    averageRepoForks: number;
    averageRepoAgeDays: number;
    averagePushDays: number;
  };

  languages: {
    language: string;
    repos: number;
    totalRepoStars: number;
    totalRepoForks: number;
    averageRepoStars: number;
    averageRepoForks: number;
  }[];

  owners: {
    owner: string;
    repos: number;
    totalRepoStars: number;
    averageRepoStars: number;
  }[];

  topStarredRepos: {
    repo: string;
    language: string | null;
    stars: number;
    forks: number;
  }[];

  creationTimeline: {
    year: number;
    repos: number;
  }[];
};

export type TagsProcessed = {
  stats: {
    repo: string;
    name: string;
    commitSha: string;
    nodeId: string;
    versionType: string;
    prefix: string;
    nameLength: number;
    isSemanticVersion: boolean;
  }[];

  overview: {
    totalTags: number;
    semanticVersionTags: number;
    nonSemanticVersionTags: number;
    uniqueRepositories: number;
    uniquePrefixes: number;
  };

  repos: {
    repo: string;
    tags: number;
  }[];

  commits: {
    commitSha: string;
    tags: number;
  }[];

  versionTypes: {
    versionType: string;
    count: number;
  }[];

  prefixes: {
    prefix: string;
    count: number;
  }[];

  topRepositories: {
    repo: string;
    tags: number;
  }[];

  sharedCommitTags: {
    commitSha: string;
    tags: number;
  }[];

  longestTagNames: {
    repo: string;
    name: string;
    nameLength: number;
  }[];
};

export type WorkflowRunsProcessed = {
  stats: {
    id: string | number;
    repo: string;
    workflowId: number;
    name: string | null;
    branch: string | null;
    event: string;
    status: string | null;
    conclusion: string | null;
    actor: string | null;
    runNumber: number;
    createdYear: number;
    ageDays: number;
    updateDurationMinutes: number;
    isCompleted: boolean;
    isSuccessful: boolean;
    isFailed: boolean;
  }[];

  overview: {
    totalRuns: number;
    completedRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
    failureRate: number;
    averageUpdateDurationMinutes: number;
  };

  repos: {
    repo: string;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
    failureRate: number;
  }[];

  workflows: {
    workflow: string;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
  }[];

  events: {
    event: string;
    count: number;
  }[];

  statuses: {
    status: string;
    count: number;
  }[];

  conclusions: {
    conclusion: string;
    count: number;
  }[];

  branches: {
    branch: string;
    count: number;
  }[];

  actors: {
    actor: string;
    count: number;
  }[];

  creationTimeline: {
    year: number;
    runs: number;
  }[];

  longestRuns: {
    repo: string;
    workflow: string | null;
    durationMinutes: number;
  }[];
};
