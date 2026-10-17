import { Link, type Location } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { Fragment } from "react";
import type { SidebarSection } from "@/types/types";

type SideBarProps = {
  Sections: SidebarSection[];
  onNavigate: () => void;
  isOpen: boolean;
  Session: Session;
  location: Location;
};

export default function SideBar({
  onNavigate,
  isOpen,
  Session,
  location,
  Sections,
}: SideBarProps) {
  const isAdmin = Session?.user.user_metadata.role === "admin";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {Sections.map((section, index) => (
        <Fragment key={`${section}-${index}`}>
          <p className="sidebar-section-label">{section.title}</p>
          {section.links.map((link, index) => {
            if (link.adminOnly && !isAdmin) return null;
            return (
              <Link
                to={link.to}
                key={`${link}-${index}`}
                className={`sidebar-link ${location.pathname === link.to ? "active" : ""}`}
                onClick={onNavigate}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
          {index !== Sections.length - 1 && <hr className="sidebar-divider" />}
        </Fragment>
      ))}
    </aside>
  );
}
