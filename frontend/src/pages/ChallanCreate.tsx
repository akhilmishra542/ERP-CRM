import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { challanApi, customerApi, productApi } from "../api";
import { getApiErrorMessage } from "../api/client";
import { Customer, Product } from "../types";
import { Button, Card, Input, PageHeader, Select } from "../components/ui";

interface LineItem {
  productId: string;
  quantity: number;
}

export default function ChallanCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<"DRAFT" | "CONFIRMED" | null>(null);

  useEffect(() => {
    async function loadOptions() {
      const [custRes, prodRes] = await Promise.all([
        customerApi.list({ limit: 100 }),
        productApi.list({ limit: 100 }),
      ]);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    }
    loadOptions();
  }, []);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addRow() {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function productById(id: string) {
    return products.find((p) => p.id === id);
  }

  const total = items.reduce((sum, it) => {
    const p = productById(it.productId);
    return sum + (p ? Number(p.unitPrice) * it.quantity : 0);
  }, 0);

  async function handleSave(status: "DRAFT" | "CONFIRMED") {
    setError("");
    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    if (validItems.length === 0) {
      setError("Add at least one product.");
      return;
    }
    setSaving(status);
    try {
      const res = await challanApi.create({ customerId, items: validItems, status });
      navigate(`/challans/${res.data.data.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <PageHeader title="New Sales Challan" subtitle="Select a customer, add products, then save as draft or confirm to reduce stock." />

      {error && (
        <div className="mb-5 text-sm text-rust bg-rust/10 border border-rust/30 rounded px-4 py-3">
          {error}
        </div>
      )}

      <Card className="p-6 space-y-6">
        <Select label="Customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">Select a customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.businessName ? `— ${c.businessName}` : ""}
            </option>
          ))}
        </Select>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink/60">Products</span>
            <Button type="button" variant="ghost" size="sm" onClick={addRow}>
              + Add product
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const product = productById(item.productId);
              return (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, { productId: e.target.value })}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — stock: {p.currentStock}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="w-28 text-sm text-ink/50 font-mono-num pt-2.5">
                    {product ? `₹${(Number(product.unitPrice) * item.quantity).toLocaleString("en-IN")}` : "—"}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(idx)}>
                    ✕
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-black/10">
          <div className="text-sm text-ink/60">
            Total: <span className="font-mono-num font-semibold text-ink">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!!saving} onClick={() => handleSave("DRAFT")}>
              {saving === "DRAFT" ? "Saving..." : "Save as Draft"}
            </Button>
            <Button disabled={!!saving} onClick={() => handleSave("CONFIRMED")}>
              {saving === "CONFIRMED" ? "Confirming..." : "Confirm & Reduce Stock"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
