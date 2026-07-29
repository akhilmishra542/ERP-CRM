import { useEffect, useState } from "react";
import { productApi } from "../api";
import { Product } from "../types";
import { Button, Card, EmptyState, Input, PageHeader, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import ProductFormModal from "../components/ProductFormModal";
import StockMovementModal from "../components/StockMovementModal";

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [movementProduct, setMovementProduct] = useState<Product | undefined>();

  const canEdit = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  async function load() {
    setLoading(true);
    try {
      const res = await productApi.list({ page, limit: 15, search: search || undefined });
      setProducts(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  const money = (v: string | number) =>
    `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <PageHeader
        title="Products & Inventory"
        subtitle="Track stock levels, pricing, and warehouse locations."
        action={canEdit && <Button onClick={() => setShowModal(true)}>+ New Product</Button>}
      />

      <form onSubmit={handleSearchSubmit} className="mb-5">
        <Input
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <Card>
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" subtitle="Try adjusting your search." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-ink/40">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Location</th>
                {canEdit && <th className="px-5 py-3 font-medium"></th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.currentStock <= p.minStockAlert;
                return (
                  <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3 font-mono-num text-ink/70">{p.sku}</td>
                    <td className="px-5 py-3 text-ink/70">{p.category || "—"}</td>
                    <td className="px-5 py-3 font-mono-num">{money(p.unitPrice)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono-num font-semibold ${low ? "text-rust" : "text-ink"}`}>
                        {p.currentStock}
                      </span>
                      {low && <span className="text-[10px] text-rust ml-1 uppercase">low</span>}
                    </td>
                    <td className="px-5 py-3 text-ink/60">{p.warehouseLoc || "—"}</td>
                    {canEdit && (
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => setEditingProduct(p)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setMovementProduct(p)}>
                          Record Movement
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-ink/50 flex items-center px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(undefined)}
          onSaved={() => {
            setEditingProduct(undefined);
            load();
          }}
        />
      )}
      {movementProduct && (
        <StockMovementModal
          product={movementProduct}
          onClose={() => setMovementProduct(undefined)}
          onSaved={() => {
            setMovementProduct(undefined);
            load();
          }}
        />
      )}
    </div>
  );
}
