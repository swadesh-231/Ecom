import { Link } from "react-router";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/collection/${product._id}`} className="group block">
      <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-xl">
        {product.images[0]?.url && (
          <img
            src={product.images[0].url}
            alt={product.name}
            loading="lazy"
            className={cn(
              "size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
              outOfStock && "opacity-60",
            )}
          />
        )}

        {outOfStock && (
          <span className="bg-background/90 text-foreground absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase">
            Sold out
          </span>
        )}

        {/* Quick add — appears on hover (desktop) */}
        {!outOfStock && (
          <button
            onClick={handleAdd}
            aria-label="Add to cart"
            className="bg-primary text-primary-foreground absolute right-3 bottom-3 flex size-10 translate-y-2 items-center justify-center rounded-full opacity-0 shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/90 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-0.5">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          {product.category}
        </p>
        <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.numReviews > 0 && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Star className="size-3 fill-current" />
              {product.ratings.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
