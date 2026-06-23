import { Link, NavLink, Outlet } from "react-router";
import { UserButton } from "@clerk/react";
import { LayoutDashboard, Package, ScrollText, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/orders", label: "Orders", icon: ScrollText, end: false },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="bg-card hidden w-60 shrink-0 flex-col border-r p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2 font-semibold">
          <Store className="size-5" />
          <span className="text-lg">Nestify</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <UserButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:hidden">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <Store className="size-5" /> Admin
          </Link>
          <UserButton />
        </header>

        {/* Mobile tab bar */}
        <nav className="flex gap-1 border-b p-2 md:hidden">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
