export type ReportType = "weekly" | "monthly" | "yearly";

export type ReportData = {
  _id: string;
  amount: number;
  label?: string;
};
