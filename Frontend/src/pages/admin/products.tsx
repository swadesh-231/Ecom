import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/loader";
import { ProductDialog } from "@/components/admin/product-dialog";
import { getProducts, deleteProduct } from "@/lib/services";
import { getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = () => {
    setLoading(true);
    getProducts({ limit: 50, sort: "newest" })
      .then((res) => setProducts(res.products))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product._id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={openCreate}>
          <Plus /> Add product
        </Button>
      </div>

      {loading ? (
        <Loader className="min-h-[40vh]" />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Stock</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-md">
                        {product.images[0]?.url && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <span className="line-clamp-1 font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary">{product.category}</Badge>
                  </td>
                  <td className="p-3">{formatPrice(product.price)}</td>
                  <td className="p-3">
                    {product.stock > 0 ? (
                      product.stock
                    ) : (
                      <span className="text-destructive">Out</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => openEdit(product)}
                        aria-label="Edit"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDelete(product)}
                        aria-label="Delete"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground p-8 text-center"
                  >
                    No products yet. Add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        onSaved={load}
      />
    </div>
  );
}
