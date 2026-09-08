"use client";

import { DASHBOARD_LINKS } from "@/lib/constants";
import { signOutAction } from "@/lib/auth-actions";
import NavLink from "./NavLink";

const LINK_CLASS = "focus-ring block rounded-lg px-3.5 py-2 text-sm transition-colors";
const ACTIVE_CLASS = "bg-primary/10 font-medium text-primary";
const INACTIVE_CLASS = "text-muted-foreground hover:bg-muted hover:text-foreground";

interface DashboardSidebarProps {
  adminEmail: string;
}

export default function DashboardSidebar({ adminEmail }: DashboardSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-border bg-card md:h-dvh md:w-60 md:border-r">
      <div className="px-6 py-6">
        <p className="font-display flex items-center gap-2 text-sm font-semibold text-foreground">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
          Admin Panel
        </p>
      </div>

      <nav className="flex-1">
        <ul className="flex flex-col gap-1 px-3">
          {DASHBOARD_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                exact={link.href === "/dashboard"}
                className={LINK_CLASS}
                activeClassName={ACTIVE_CLASS}
                inactiveClassName={INACTIVE_CLASS}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mx-3 my-4 border-t border-border" />

        <ul className="px-3">
          <li>
            <NavLink
              href="/"
              className={LINK_CLASS}
              activeClassName={ACTIVE_CLASS}
              inactiveClassName={INACTIVE_CLASS}
            >
              &larr; Back to Site
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="border-t border-border px-6 py-4">
        <p className="truncate text-xs text-muted-foreground" title={adminEmail}>
          Signed in as <span className="text-foreground">{adminEmail}</span>
        </p>
        <form action={signOutAction} className="mt-2">
          <button
            type="submit"
            className="focus-ring w-full rounded-lg border border-border px-3.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
