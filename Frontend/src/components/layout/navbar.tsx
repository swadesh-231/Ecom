import { Link, NavLink } from "react-router";
import { Show, UserButton } from "@clerk/react";
import { LayoutDashboard, Moon, ShoppingBag, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, selectTotalItems } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useIsAdmin } from "@/store/auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative text-sm transition-colors hover:text-foreground",
    "after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-foreground after:transition-all after:duration-300",
    isActive
      ? "text-foreground after:w-full"
      : "text-muted-foreground after:w-0 hover:after:w-full",
  );

export function Navbar() {
  const totalItems = useCart(selectTotalItems);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const isAdmin = useIsAdmin();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-background/70 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-[0.2em] uppercase"
        >
          Nestify
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/collections" className={navLinkClass}>
            Shop
          </NavLink>
          <Show when="signed-in">
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          </Show>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag />
            {totalItems > 0 && (
              <span className="bg-foreground text-background absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums">
                {totalItems}
              </span>
            )}
          </Button>

          {isAdmin && (
            <Button asChild variant="ghost" size="icon" aria-label="Admin">
              <Link to="/admin">
                <LayoutDashboard />
              </Link>
            </Button>
          )}

          <Show when="signed-out">
            <Button asChild variant="ghost" size="sm" className="max-sm:hidden">
              <Link to="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/sign-up">Sign up</Link>
            </Button>
          </Show>

          <Show when="signed-in">
            <div className="ml-1 flex items-center">
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
