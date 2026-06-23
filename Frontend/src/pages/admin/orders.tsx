import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/loader";
import { getAllOrders, updateOrderStatus } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader className="min-h-[40vh]" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground py-20 text-center">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Payment</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customer =
                  typeof order.userId === "object" ? order.userId : null;
                return (
                  <tr key={order._id} className="border-t">
                    <td className="p-3 font-mono">#{order._id.slice(-8)}</td>
                    <td className="p-3">
                      {customer ? (
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {customer.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">{formatPrice(order.totalAmount)}</td>
                    <td className="p-3">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="secondary">
                          {order.paymentMethod === "cod" ? "COD" : "Card"}
                        </Badge>
                        <Badge
                          variant={
                            order.paymentStatus === "paid"
                              ? "success"
                              : "outline"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">{formatDate(order.createdAt)}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          changeStatus(order._id, e.target.value as OrderStatus)
                        }
                        className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
