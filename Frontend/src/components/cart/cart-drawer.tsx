import { Link } from "react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, selectTotalPrice } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const cartOpen = useUI((s) => s.cartOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);

  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const total = useCart(selectTotalPrice);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">Your cart is empty.</p>
            <Button asChild variant="outline" onClick={() => setCartOpen(false)}>
              <Link to="/collections">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-lg">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-medium">
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {formatPrice(item.price)}
                    </span>
                    <div className="mt-auto flex items-center gap-2">
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        disabled={item.qty <= 1}
                      >
                        <Minus />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <Button
                        size="icon-xs"
                        variant="outline"
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-5">
              <div className="mb-3 flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Separator className="mb-3" />
              <Button asChild size="lg" className="w-full">
                <Link to="/checkout" onClick={() => setCartOpen(false)}>
                  Checkout
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
