import { readSettings } from "@/helper/settings";
import type { AppSettings, UpdateSettingsFunction } from "@/types/settings";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const SETTINGS_KEY = "Settings";

type SettingsContextType = {
  Settings: AppSettings;
  updateSetting: UpdateSettingsFunction;
};

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// Custom hook to access the context
export function useSettingsContext() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider",
    );
  }

  return context;
}

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize settings from localStorage
  const [Settings, setSettings] = useState<AppSettings>(() =>
    readSettings(SETTINGS_KEY),
  );

  // Update a setting
  function updateSetting<Setting extends keyof AppSettings>(
    setting: Setting,
    value: AppSettings[Setting],
  ) {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  }

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(Settings));
  }, [Settings]);

  // Apply theme and listen for operating system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function ApplyTheme() {
      const actualTheme =
        Settings.theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : Settings.theme;

      document.documentElement.setAttribute("data-theme", actualTheme);
    }

    ApplyTheme();

    if (Settings.theme === "system") {
      mediaQuery.addEventListener("change", ApplyTheme);

      return () => {
        mediaQuery.removeEventListener("change", ApplyTheme);
      };
    }
  }, [Settings.theme]);

  // Apply font size and compact mode
  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", Settings.fontSize);

    if (Settings.compactMode) {
      document.documentElement.setAttribute("data-compact", "true");
    } else {
      document.documentElement.removeAttribute("data-compact");
    }
  }, [Settings.fontSize, Settings.compactMode]);

  const value = {
    Settings,
    updateSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
