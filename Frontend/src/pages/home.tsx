import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/product-card";
import { getProducts, getCategories } from "@/lib/services";
import type { Product } from "@/lib/types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ sort: "newest", limit: 24 }),
      getCategories(),
    ])
      .then(([res, cats]) => {
        setProducts(res.products);
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const newArrivals = products.slice(0, 8);
  const imageForCategory = (cat: string) =>
    products.find((p) => p.category === cat)?.images[0]?.url;

  return (
    <div>
      {/* Hero — full-bleed editorial image */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={HERO_IMG}
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:pb-24">
              <div className="max-w-xl text-white">
                <p className="text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
                  New Collection · 2026
                </p>
                <h1 className="mt-4 text-5xl leading-[1.05] font-semibold md:text-7xl">
                  Designed to last,
                  <br />
                  made to love.
                </h1>
                <p className="mt-5 max-w-md text-base text-white/80 md:text-lg">
                  A considered edit of everyday essentials — crafted with care,
                  priced with honesty.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-neutral-900 hover:bg-white/90"
                  >
                    <Link to="/collections">
                      Shop the collection <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white"
                  >
                    <Link to="/collections">Browse all</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              icon: Truck,
              title: "Free shipping",
              desc: "On every order, no minimum",
            },
            {
              icon: RotateCcw,
              title: "30-day returns",
              desc: "Hassle-free, no questions asked",
            },
            {
              icon: ShieldCheck,
              title: "Secure checkout",
              desc: "Stripe & Cash on Delivery",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex items-center justify-center gap-4 px-6 py-7"
            >
              <div className="bg-muted/50 text-foreground flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:bg-muted">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Browse categories</h2>
              <p className="text-muted-foreground mt-1">
                Find exactly what you're looking for.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const img = imageForCategory(cat);
              return (
                <Link
                  key={cat}
                  to={`/collections?category=${encodeURIComponent(cat)}`}
                  className="group relative flex aspect-[5/4] items-end overflow-hidden rounded-2xl bg-muted"
                >
                  {img && (
                    <img
                      src={img}
                      alt={cat}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="relative flex w-full items-center justify-between p-4 text-white">
                    <span className="font-medium">{cat}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold">New arrivals</h2>
            <p className="text-muted-foreground mt-1">
              The latest additions to the store.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/collections">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
