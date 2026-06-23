import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/common/loader";
import { getMyOrders } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  Pending: "warning",
  Shipped: "secondary",
  Delivered: "success",
  Cancelled: "destructive",
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-center">
          <Package className="size-10" />
          <p>You haven't placed any orders yet.</p>
          <Button asChild variant="outline">
            <Link to="/collections">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm">#{order._id.slice(-8)}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {order.paymentMethod === "cod" ? "COD" : "Card"}
                    </Badge>
                    <Badge variant={statusVariant[order.status]}>
                      {order.status}
                    </Badge>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "success" : "outline"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground line-clamp-1">
                        {item.name} × {item.qty}
                      </span>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
