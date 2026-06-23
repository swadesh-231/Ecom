import { Link } from "react-router";
import { Store } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/collections" },
      { label: "New arrivals", to: "/collections?sort=newest" },
      { label: "Top rated", to: "/collections?sort=topRated" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My orders", to: "/orders" },
      { label: "Sign in", to: "/sign-in" },
      { label: "Sign up", to: "/sign-up" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <Store className="size-5" />
            <span className="text-lg">Nestify</span>
          </div>
          <p className="text-muted-foreground mt-3 max-w-xs text-sm">
            Curated essentials for everyday living. Quality products at honest
            prices, delivered to your door.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} Nestify. A demo e-commerce store.</p>
          <p>Secure payments via Stripe & Cash on Delivery</p>
        </div>
      </div>
    </footer>
  );
}
