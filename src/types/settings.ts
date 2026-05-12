type Theme = "light" | "dark";
type FontSize = "normal" | "large";
export type PageSize = 5 | 10 | 25 | 50 | 100;
type ExportFormat = "csv" | "excel";

export type AppSettings = {
  theme: Theme;
  fontSize: FontSize;
  compactMode: boolean;
  pageSize: PageSize;
  exportFormat: ExportFormat;
  archiveRetention: number;
};
