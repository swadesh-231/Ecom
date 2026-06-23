import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "@clerk/react";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/common/loader";
import { getProduct, getReviews, createReview } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useUI((s) => s.setCartOpen);

  const load = (productId: string) => {
    setLoading(true);
    Promise.all([getProduct(productId), getReviews(productId)])
      .then(([p, r]) => {
        setProduct(p);
        setReviews(r);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  if (loading) return <Loader className="min-h-[60vh]" />;
  if (!product)
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="link">
          <Link to="/collections">Back to shop</Link>
        </Button>
      </div>
    );

  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
    setCartOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="bg-muted aspect-[4/5] overflow-hidden rounded-2xl">
            {product.images[activeImage]?.url && (
              <img
                src={product.images[activeImage].url}
                alt={product.name}
                className="size-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "bg-muted size-16 overflow-hidden rounded-lg ring-2 transition",
                    activeImage === i
                      ? "ring-foreground"
                      : "ring-transparent hover:ring-border",
                  )}
                >
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:py-2">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {product.ratings.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              {product.numReviews} reviews
            </span>
          </div>

          <p className="mt-6 text-3xl font-semibold">
            {formatPrice(product.price)}
          </p>

          <Separator className="my-6" />

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2 rounded-full",
                outOfStock ? "bg-destructive" : "bg-emerald-500",
              )}
            />
            <span className="text-muted-foreground">
              {outOfStock
                ? "Out of stock"
                : `In stock — ${product.stock} available`}
            </span>
          </div>

          {!outOfStock && (
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-lg border">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus />
                </Button>
                <span className="w-10 text-center text-sm font-medium tabular-nums">
                  {qty}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus />
                </Button>
              </div>
              <Button size="lg" onClick={handleAddToCart} className="flex-1">
                <ShoppingCart /> Add to cart
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-12" />

      {/* Reviews */}
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Customer reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-4",
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(review.createdAt)}
                  </p>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Write a review</h2>
          {isSignedIn ? (
            <ReviewForm
              productId={product._id}
              onSubmitted={() => id && load(id)}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Please{" "}
              <Link to="/sign-in" className="text-primary underline">
                sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please write a comment");
    setSubmitting(true);
    try {
      await createReview(productId, { rating, comment: comment.trim() });
      toast.success("Review submitted");
      setComment("");
      onSubmitted();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="mb-2">Rating</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              aria-label={`${i + 1} stars`}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  i < rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="comment" className="mb-2">
          Comment
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product"
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
