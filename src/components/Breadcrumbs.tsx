import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getBreadcrumbs } from "@/helper/functions";
import type { BreadcrumbItem } from "@/types/types";

export default function Breadcrumbs() {
  const location = useLocation();

  const breadcrumbs: BreadcrumbItem[] = getBreadcrumbs(location);

  // Always show breadcrumb (including on home)
  return (
    <nav
      className='page-breadcrumb flex items-center gap-2'
      aria-label='Breadcrumb'
    >
      <Link
        to='/'
        title='Home'
        className='flex items-center gap-2 text-(--text-muted) transition-colors hover:text-(--navy)'
      >
        <span className='hidden sm:inline uppercase tracking-[0.06em] text-(--text-muted)'>
          Home
        </span>
      </Link>

      {breadcrumbs.slice(1).map((breadcrumb, index) => (
        <div key={`breadcrumb-${index}`} className='flex items-center gap-2'>
          <ChevronRight
            size={14}
            aria-hidden='true'
            className='text-(--text-muted)'
          />
          {index < breadcrumbs.length - 2 ? (
            <Link
              to={breadcrumb.path}
              className='text-(--text-muted) transition-colors hover:text-(--navy) hover:underline'
            >
              {breadcrumb.label}
            </Link>
          ) : (
            <span className='font-semibold text-(--navy)'>
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
