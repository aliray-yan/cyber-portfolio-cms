"use client";

import { DASHBOARD_LINKS } from "@/lib/constants";
import NavLink from "./NavLink";

const LINK_CLASS = "focus-ring block rounded px-3 py-2 text-sm transition-colors";
const ACTIVE_CLASS = "bg-navy-800 text-cyan-400";
const INACTIVE_CLASS = "text-slate-400 hover:bg-navy-800 hover:text-slate-100";

export default function DashboardSidebar() {
  return (
    <aside className="w-full shrink-0 border-white/10 bg-navy-900 md:h-screen md:w-60 md:border-r">
      <div className="px-6 py-6">
        <p className="font-mono text-sm font-semibold text-slate-100">
          <span className="text-cyan-400">{"//"}</span> admin panel
        </p>
      </div>

      <nav>
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

        <div className="mx-3 my-4 border-t border-white/10" />

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
    </aside>
  );
}
