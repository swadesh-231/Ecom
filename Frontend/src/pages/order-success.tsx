import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/common/loader";
import { getOrder } from "@/lib/services";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const clearCart = useCart((s) => s.clear);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    // Payment succeeded and Stripe redirected back — empty the cart.
    clearCart();

    if (!orderId) return;
    getOrder(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId, clearCart]);

  if (loading) return <Loader className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
      <h1 className="mt-4 text-2xl font-bold">Thank you for your order!</h1>
      <p className="text-muted-foreground mt-2">
        {order?.paymentMethod === "cod"
          ? "Your order is confirmed. Pay with cash when it's delivered."
          : "Your payment was successful and your order is confirmed."}
      </p>

      {order && (
        <Card className="mt-6 text-left">
          <CardContent className="space-y-2 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono">#{order._id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="capitalize">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <Button asChild>
          <Link to="/collections">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/orders">View my orders</Link>
        </Button>
      </div>
    </div>
  );
}
