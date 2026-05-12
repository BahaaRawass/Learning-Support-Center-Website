import { useEffect, useState } from "react";

export type AppSettings = {
  theme: "light" | "dark";
  fontSize: "normal" | "large";
  compactMode: boolean;
  pageSize: number;
  exportFormat: "csv" | "excel";
  archiveRetention: number;
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
    fontSize: (localStorage.getItem("fontSize") as "normal" | "large") || "normal",
    compactMode: localStorage.getItem("compactMode") === "true",
    pageSize: parseInt(localStorage.getItem("pageSize") || "10"),
    exportFormat: (localStorage.getItem("exportFormat") as "csv" | "excel") || "csv",
    archiveRetention: parseInt(localStorage.getItem("archiveRetention") || "180"),
  });

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", settings.theme);

    // Apply font size
    document.documentElement.setAttribute("data-font-size", settings.fontSize);

    // Apply compact mode
    if (settings.compactMode) {
      document.documentElement.setAttribute("data-compact", "true");
    } else {
      document.documentElement.removeAttribute("data-compact");
    }
  }, [settings]);

  function updateTheme(theme: "light" | "dark") {
    setSettings((prev) => ({ ...prev, theme }));
    localStorage.setItem("theme", theme);
  }

  function updateFontSize(fontSize: "normal" | "large") {
    setSettings((prev) => ({ ...prev, fontSize }));
    localStorage.setItem("fontSize", fontSize);
  }

  function updateCompactMode(compactMode: boolean) {
    setSettings((prev) => ({ ...prev, compactMode }));
    localStorage.setItem("compactMode", compactMode.toString());
  }

  function updatePageSize(pageSize: number) {
    setSettings((prev) => ({ ...prev, pageSize }));
    localStorage.setItem("pageSize", pageSize.toString());
  }

  function updateExportFormat(exportFormat: "csv" | "excel") {
    setSettings((prev) => ({ ...prev, exportFormat }));
    localStorage.setItem("exportFormat", exportFormat);
  }

  function updateArchiveRetention(archiveRetention: number) {
    setSettings((prev) => ({ ...prev, archiveRetention }));
    localStorage.setItem("archiveRetention", archiveRetention.toString());
  }

  return {
    settings,
    updateTheme,
    updateFontSize,
    updateCompactMode,
    updatePageSize,
    updateExportFormat,
    updateArchiveRetention,
  };
}
