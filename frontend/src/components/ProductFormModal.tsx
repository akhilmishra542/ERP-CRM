import { FormEvent, useState } from "react";
import { productApi } from "../api";
import { getApiErrorMessage } from "../api/client";
import { Product } from "../types";
import { Button, Input } from "./ui";

export default function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    category: product?.category || "",
    unitPrice: product ? String(product.unitPrice) : "",
    currentStock: product ? String(product.currentStock) : "0",
    minStockAlert: product ? String(product.minStockAlert) : "0",
    warehouseLoc: product?.warehouseLoc || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category || undefined,
        unitPrice: Number(form.unitPrice),
        minStockAlert: Number(form.minStockAlert),
        warehouseLoc: form.warehouseLoc || undefined,
        ...(product ? {} : { currentStock: Number(form.currentStock) }),
      };
      if (product) {
        await productApi.update(product.id, payload as any);
      } else {
        await productApi.create(payload as any);
      }
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="px-6 py-4 border-b border-black/10">
          <h2 className="font-display text-lg font-semibold">
            {product ? "Edit Product" : "New Product"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            <Input label="SKU / Code" required value={form.sku} onChange={(e) => update("sku", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={(e) => update("category", e.target.value)} />
            <Input
              label="Unit Price (₹)"
              type="number"
              step="0.01"
              required
              value={form.unitPrice}
              onChange={(e) => update("unitPrice", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {!product && (
              <Input
                label="Opening Stock"
                type="number"
                value={form.currentStock}
                onChange={(e) => update("currentStock", e.target.value)}
              />
            )}
            <Input
              label="Min Stock Alert Qty"
              type="number"
              value={form.minStockAlert}
              onChange={(e) => update("minStockAlert", e.target.value)}
            />
          </div>
          <Input
            label="Warehouse / Location"
            value={form.warehouseLoc}
            onChange={(e) => update("warehouseLoc", e.target.value)}
          />

          {product && (
            <p className="text-xs text-ink/40">
              To change stock quantity, use "Record Movement" from the product row instead — this
              keeps the stock log accurate.
            </p>
          )}

          {error && (
            <div className="text-xs text-rust bg-rust/10 border border-rust/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
