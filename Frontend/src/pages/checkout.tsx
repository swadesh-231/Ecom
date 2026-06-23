import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart, selectTotalPrice } from "@/store/cart";
import { createCheckoutSession, createOrder } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

const emptyAddress = {
  fullName: "",
  street: "",
  city: "",
  postalCode: "",
  country: "",
};

const methods: {
  value: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "cod",
    label: "Cash on Delivery",
    desc: "Pay with cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: "card",
    label: "Card (Stripe)",
    desc: "Pay securely online with your card.",
    icon: CreditCard,
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const total = useCart(selectTotalPrice);
  const clear = useCart((s) => s.clear);

  const [address, setAddress] = useState(emptyAddress);
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof emptyAddress, value: string) =>
    setAddress((a) => ({ ...a, [key]: value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");

    const payload = {
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      address,
    };

    setSubmitting(true);
    try {
      if (method === "card") {
        // Hand off to Stripe's hosted checkout; cart is cleared on return.
        const { url } = await createCheckoutSession(payload);
        window.location.href = url;
        return;
      }

      // Cash on Delivery — create the order directly.
      const order = await createOrder(payload);
      clear();
      toast.success("Order placed!");
      navigate(`/order-success?orderId=${order._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button asChild className="mt-4">
          <Link to="/collections">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <form onSubmit={placeOrder} className="grid gap-6 md:grid-cols-5">
        <div className="space-y-6 md:col-span-3">
          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName" className="mb-1.5">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  required
                  value={address.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street" className="mb-1.5">
                  Street address
                </Label>
                <Input
                  id="street"
                  required
                  value={address.street}
                  onChange={(e) => update("street", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city" className="mb-1.5">
                  City
                </Label>
                <Input
                  id="city"
                  required
                  value={address.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postalCode" className="mb-1.5">
                  Postal code
                </Label>
                <Input
                  id="postalCode"
                  required
                  value={address.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="country" className="mb-1.5">
                  Country
                </Label>
                <Input
                  id="country"
                  required
                  value={address.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {methods.map(({ value, label, desc, icon: Icon }) => {
                const active = method === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMethod(value)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-muted-foreground text-xs">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="md:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1">
                  {item.name} × {item.qty}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {method === "card" ? <CreditCard /> : <Banknote />}
              {submitting
                ? method === "card"
                  ? "Redirecting…"
                  : "Placing order…"
                : method === "card"
                  ? "Pay with Stripe"
                  : "Place order (COD)"}
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              {method === "card"
                ? "You'll be redirected to Stripe's secure checkout."
                : "You'll pay in cash when your order is delivered."}
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
