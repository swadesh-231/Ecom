import { useEffect, useState } from "react";
import { DollarSign, Package, ScrollText, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/common/loader";
import { getProducts, getAllOrders } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type Stats = {
  products: number;
  orders: number;
  sales: number;
  pending: number;
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([getProducts({ limit: 1 }), getAllOrders()])
      .then(([productsRes, orders]) => {
        const sales = orders
          .filter((o) => o.paymentStatus === "paid")
          .reduce((sum, o) => sum + o.totalAmount, 0);
        setStats({
          products: productsRes.pagination.total,
          orders: orders.length,
          sales,
          pending: orders.filter((o) => o.status === "Pending").length,
        });
      })
      .catch((e) => toast.error(getErrorMessage(e)));
  }, []);

  if (!stats) return <Loader className="min-h-[40vh]" />;

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package },
    { label: "Total Orders", value: stats.orders, icon: ScrollText },
    { label: "Paid Sales", value: formatPrice(stats.sales), icon: DollarSign },
    { label: "Pending Orders", value: stats.pending, icon: Clock },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
