import { Link, type Location } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import type { SidebarSection } from "@/types/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  BugIcon,
  ChevronRight,
  ChevronsUpDown,
  DatabaseIcon,
  LockKeyholeIcon,
  LogOutIcon,
  Monitor,
  SettingsIcon,
  UserCircleIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type {
  AppSettings,
  SettingsExportFormat,
  SettingsFontSize,
  SettingsPageSize,
  SettingsTheme,
  UpdateSettingsFunction,
} from "@/types/settings";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useState, type ComponentProps } from "react";

type SideBarProps = {
  Sections: SidebarSection[];
  Session: Session | null;
  location: Location;
  LogOut: () => Promise<boolean>;
  Settings: AppSettings;
  updateSetting: UpdateSettingsFunction;
};

export default function SideBar({
  Session,
  location,
  Sections,
  LogOut,
  Settings,
  updateSetting,
}: SideBarProps) {
  const isAdmin = Session?.user.user_metadata.role === "admin";

  const visibleSections = Sections.map((section) => ({
    ...section,
    links: section.links.filter((link) => {
      // Explicitly hidden links are never displayed.
      if (link.visible === false) return false;

      // Admin-only links require an admin.
      if (link.adminOnly && !isAdmin) return false;

      return true;
    }),
  })).filter((section) => section.links.length > 0);
  // Avoid displaying sections with no links.

  const { setOpenMobile, isMobile, state: SidebarState } = useSidebar();
  const [SidebarCollapsible, setSidebarCollapsible] =
    useState<ComponentProps<typeof Sidebar>["collapsible"]>("offcanvas");

  const email = Session?.user.email;

  const DisplayName: string =
    Session?.user.user_metadata?.display_name?.trim() ||
    email?.slice(0, email.indexOf("@")) ||
    "";

  const initials =
    DisplayName.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "";

  return (
    <Sidebar className="app-sidebar" collapsible={SidebarCollapsible}>
      <SidebarContent>
        {visibleSections.map((section) => (
          <Collapsible key={section.title} defaultOpen={true}>
            <SidebarGroup>
              <CollapsibleTrigger className="group">
                <SidebarGroupLabel className="sidebar-section-label">
                  {section.title}
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.links.map((link) => {
                      const isActive = location.pathname === link.to;
                      return (
                        <SidebarMenuItem key={link.label}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={link.label}
                          >
                            <Link
                              to={link.to}
                              className={`sidebar-link ${isActive ? "active" : ""}`}
                              onClick={() => setOpenMobile(false)}
                            >
                              {link.icon}
                              <span>{link.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        {SidebarState === "expanded" && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex justify-between">
                    <Label
                      htmlFor="sidebar-collapse"
                      className="cursor-pointer"
                    >
                      Sidebar Collapses to: {SidebarCollapsible}
                    </Label>
                    <Switch
                      id="sidebar-collapse"
                      checked={SidebarCollapsible == "icon"}
                      onCheckedChange={(checked) =>
                        setSidebarCollapsible(checked ? "icon" : "offcanvas")
                      }
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar>
                    <AvatarImage
                      src={Session?.user.user_metadata.avatar_url}
                      alt={Session?.user.user_metadata.display_name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {Session?.user.user_metadata.display_name || "N/A"}
                    </span>
                    <span className="truncate text-xs">
                      {Session?.user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                // className="w-full z-99999"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={Session?.user.user_metadata.avatar_url}
                          alt={
                            Session?.user.user_metadata.display_name || "User"
                          }
                        />
                        <AvatarFallback className="rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {Session?.user.user_metadata.display_name || "N/A"}
                        </span>
                        <span className="truncate text-xs">
                          {Session?.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex gap-2 w-full">
                      <SettingsIcon />
                      Settings
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      // side={isMobile ? "bottom" : "right"}
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Settings</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link to="/settings" className="flex gap-2 w-full">
                            <UserCircleIcon /> Account
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link to="/settings" className="flex gap-2 w-full">
                            <LockKeyholeIcon /> Security
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex gap-2 w-full">
                            <Monitor /> Appearance
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Theme</DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={Settings.theme}
                                onValueChange={(value) =>
                                  updateSetting("theme", value as SettingsTheme)
                                }
                              >
                                <DropdownMenuRadioItem
                                  value="system"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  System
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="light"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  Light
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="dark"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  Dark
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Font Size</DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={Settings.fontSize}
                                onValueChange={(value) =>
                                  updateSetting(
                                    "fontSize",
                                    value as SettingsFontSize,
                                  )
                                }
                              >
                                <DropdownMenuRadioItem
                                  value="normal"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  Normal
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="large"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  Large
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>
                                Compact Mode
                              </DropdownMenuLabel>
                              <DropdownMenuCheckboxItem
                                checked={Settings.compactMode}
                                onCheckedChange={(checked) =>
                                  updateSetting("compactMode", checked)
                                }
                                className="flex gap-2 w-full cursor-pointer"
                              >
                                Compact Mode
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex gap-2 w-full">
                            <DatabaseIcon /> Data and Records
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent
                            // side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Page Size</DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={String(Settings.pageSize)}
                                onValueChange={(value) =>
                                  updateSetting(
                                    "pageSize",
                                    Number(value) as SettingsPageSize,
                                  )
                                }
                              >
                                <DropdownMenuRadioItem
                                  value="5"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  5 records per page
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="10"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  10 records per page
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="25"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  25 records per page
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="50"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  50 records per page
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="100"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  100 records per page
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>
                                Export Format
                              </DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={Settings.exportFormat}
                                onValueChange={(value) =>
                                  updateSetting(
                                    "exportFormat",
                                    value as SettingsExportFormat,
                                  )
                                }
                              >
                                <DropdownMenuRadioItem
                                  value="csv"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  CSV
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="excel"
                                  className="flex gap-2 w-full cursor-pointer"
                                >
                                  Excel
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Log Out</DropdownMenuLabel>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={LogOut}
                          className="cursor-pointer"
                        >
                          <LogOutIcon /> Log out
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Support</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link to="/feedback" className="flex gap-2 w-full">
                        <ChatBubbleBottomCenterTextIcon /> Submit Feedback
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/report" className="flex gap-2 w-full">
                        <BugIcon /> Report An Issue
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
