export type GitHubStatsCardData = {
  displayName: string;

  stats: {
    label: string;
    value: number | string;
    icon?: string;
  }[];
};

export type GitHubLanguageCardData = {
  displayName: string;

  languages: {
    name: string;
    bytes: number;
    share: number;
    color: string;
  }[];
};
