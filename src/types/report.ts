export type FetchReport = {
  name: string;

  status: "success" | "failed";

  records: number;

  error?: string;
};
