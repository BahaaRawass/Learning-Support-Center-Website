import type { AppSettings } from "@/types/settings";
import { useEffect, useState } from "react";

const SETTINGS_KEY = "Settings";
const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  fontSize: "normal",
  compactMode: false,
  pageSize: 5,
  exportFormat: "csv",
  archiveRetention: 30,
};

/**
 * Type guard to validate runtime data as AppSettings.
 *
 * Unlike a simple `as AppSettings` cast, this function actually checks that the value
 * has the correct shape and types at runtime. This is critical because localStorage can
 * contain corrupted, outdated, or manually-edited JSON that TypeScript can't know about.
 *
 * Without this guard, invalid data (e.g., `{ theme: "invalid", fontSize: 123 }`) would
 * pass TypeScript's compiler but fail at runtime when used in conditionals or DOM attributes.
 *
 * @param value - Unvalidated data, typically from JSON.parse()
 * @returns true if value is a valid AppSettings object
 */
function isAppSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<AppSettings>;

  return (
    (candidate.theme === "light" || candidate.theme === "dark") &&
    (candidate.fontSize === "normal" || candidate.fontSize === "large") &&
    typeof candidate.compactMode === "boolean" &&
    (candidate.pageSize === 5 ||
      candidate.pageSize === 10 ||
      candidate.pageSize === 25 ||
      candidate.pageSize === 50 ||
      candidate.pageSize === 100) &&
    (candidate.exportFormat === "csv" || candidate.exportFormat === "excel") &&
    typeof candidate.archiveRetention === "number" &&
    candidate.archiveRetention >= 30 &&
    candidate.archiveRetention <= 730
  );
}

/**
 * Safely read and validate settings from localStorage.
 *
 * This function is designed to be resilient in multiple scenarios:
 * - SSR environments: Returns defaults if `window` doesn't exist (e.g., Node.js)
 * - Empty storage: Returns defaults if no settings have been saved yet
 * - Corrupted data: JSON.parse() errors are caught and defaults returned
 * - Invalid schema: Type guard validates the structure before accepting
 *
 * @returns AppSettings with validated data from storage, or DEFAULT_SETTINGS as fallback
 */
function readSettings(): AppSettings {
  // SSR safety: localStorage doesn't exist in server environments
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const rawSettings = window.localStorage.getItem(SETTINGS_KEY);

  // No settings saved yet; use defaults
  if (!rawSettings) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsedSettings = JSON.parse(rawSettings) as unknown;

    // Only accept if the shape matches AppSettings (theme, fontSize, compactMode)
    if (isAppSettings(parsedSettings)) {
      return parsedSettings;
    }
  } catch {
    // JSON.parse failed; storage is corrupted. Fall back to defaults.
  }

  return DEFAULT_SETTINGS;
}

export function useSettings() {
  // Initialize with validated settings from storage, or defaults if storage is empty/corrupted
  const [Settings, setSettings] = useState<AppSettings>(readSettings);

  /**
   * Type-safe updater for a single setting.
   *
   * This generic function ensures that the setting key and value type match.
   * For example, you can only set `theme` to `"light" | "dark"`, not to an arbitrary string.
   * TypeScript will catch type mismatches at compile time.
   *
   * @param setting - The key of the setting to update (e.g., "theme", "compactMode")
   * @param value - The new value, must match the type of that setting
   */
  function updateSetting<Setting extends keyof AppSettings>(
    setting: Setting,
    value: AppSettings[Setting],
  ) {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  }

  /**
   * Effect: Persist settings to localStorage whenever they change.
   *
   * This effect runs after every state update and writes the current settings to storage.
   * It's wrapped in try/catch to handle quota exceeded, permissions denied, or storage
   * being unavailable. If persistence fails, the app continues to work with the
   * in-memory state—users just won't have their preferences saved across page reloads.
   */
  useEffect(() => {
    // SSR safety: localStorage doesn't exist in server environments
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(Settings));
    } catch {
      // Persistence failed (quota full, disabled, permissions denied, etc.).
      // App continues to work; settings just won't survive a page reload.
    }
  }, [Settings]);

  /**
   * Effect: Apply settings to the DOM for CSS to read.
   *
   * This effect updates data attributes on the root element so CSS can apply
   * theme colors, font sizes, and layout adjustments. By centralizing these changes,
   * the hook ensures consistent global state instead of spreading DOM mutations
   * across multiple components.
   */
  useEffect(() => {
    // SSR safety: document doesn't exist in server environments
    if (typeof document === "undefined") return;

    // Update CSS variables and custom properties
    document.documentElement.setAttribute("data-theme", Settings.theme);
    document.documentElement.setAttribute("data-font-size", Settings.fontSize);

    // Toggle compact mode class
    if (Settings.compactMode) {
      document.documentElement.setAttribute("data-compact", "true");
    } else {
      document.documentElement.removeAttribute("data-compact");
    }
  }, [Settings]);

  return {
    Settings, // Current settings object (never null, always valid)
    updateSetting, // Type-safe function to update a single setting
  };
}
