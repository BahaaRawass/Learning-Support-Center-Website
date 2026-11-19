import { Monitor } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import type { SettingsFontSize, SettingsSidebarCollapse, SettingsTheme } from "@/types/settings";
import { useSettingsContext } from "@/context/SettingsContext";

export default function AppearanceSection() {
  const { Settings, updateSetting } = useSettingsContext();

  return (
    <Card className="settings-section" id="appearance">
      <CardHeader className="settings-section-title flex flex-wrap items-center gap-4 pl-0">
        <Monitor size={30} />
        <div className="flex flex-col">
          <CardTitle className="font-extrabold text-[1.25rem]">
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application to your preference.
            Changes will be saved automatically.
          </CardDescription>
        </div>
      </CardHeader>

      <FieldSet>
        <FieldGroup>
          <FieldLabel>Theme</FieldLabel>
          <RadioGroup
            value={Settings.theme}
            onValueChange={(value) =>
              updateSetting("theme", value as SettingsTheme)
            }
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="system"
                id="system-theme"
                className={`${Settings.theme === "system" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="system-theme" className="cursor-pointer">
                System
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="light"
                id="light-theme"
                className={`${Settings.theme === "light" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="light-theme" className="cursor-pointer">
                Light
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="dark"
                id="dark-theme"
                className={`${Settings.theme === "dark" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="dark-theme" className="cursor-pointer">
                Dark
              </Label>
            </div>
          </RadioGroup>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Font Size</FieldLabel>
          <RadioGroup
            value={Settings.fontSize}
            onValueChange={(value) =>
              updateSetting("fontSize", value as SettingsFontSize)
            }
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="normal"
                id="normal-font"
                className={`${Settings.fontSize === "normal" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="normal-font" className="cursor-pointer">
                Normal
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="large"
                id="large-font"
                className={`${Settings.fontSize === "large" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="large-font" className="cursor-pointer">
                Large
              </Label>
            </div>
          </RadioGroup>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Sidebar Collapse</FieldLabel>
          <RadioGroup
            value={Settings.sidebarCollapse}
            onValueChange={(value) =>
              updateSetting("sidebarCollapse", value as SettingsSidebarCollapse)
            }
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="icon"
                id="icon-sidebar"
                className={`${Settings.sidebarCollapse === "icon" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="icon-sidebar" className="cursor-pointer">
                Icons
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem
                value="offcanvas"
                id="offcanvas-sidebar"
                className={`${Settings.sidebarCollapse === "offcanvas" ? "btn-primary" : ""}`}
              />
              <Label htmlFor="large-font" className="cursor-pointer">
                Full
              </Label>
            </div>
          </RadioGroup>
        </FieldGroup>

        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox
              id="compactMode"
              name="compactMode"
              checked={Settings.compactMode}
              onCheckedChange={(checked) =>
                updateSetting("compactMode", checked as boolean)
              }
              className={`${Settings.compactMode ? "btn-primary" : ""}`}
            />
            <FieldLabel htmlFor="compactMode">
              Compact Mode - Reduce spacing in betweem elements and tables for a
              denser layout.
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </Card>
  );
}
