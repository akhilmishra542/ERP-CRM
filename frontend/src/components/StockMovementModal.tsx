import { FormEvent, useState } from "react";
import { productApi } from "../api";
import { getApiErrorMessage } from "../api/client";
import { Product } from "../types";
import { Button, Input, Select } from "./ui";

export default function StockMovementModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await productApi.recordMovement(product.id, {
        quantity: Number(quantity),
        movementType,
        reason: reason || undefined,
      });
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="px-6 py-4 border-b border-black/10">
          <h2 className="font-display text-lg font-semibold">Record Stock Movement</h2>
          <p className="text-xs text-ink/40 mt-1">
            {product.name} — current stock: <span className="font-mono-num">{product.currentStock}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select label="Movement Type" value={movementType} onChange={(e) => setMovementType(e.target.value as "IN" | "OUT")}>
            <option value="IN">IN — Stock received</option>
            <option value="OUT">OUT — Stock removed</option>
          </Select>
          <Input
            label="Quantity"
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Input label="Reason" placeholder="e.g. Supplier restock, damage write-off" value={reason} onChange={(e) => setReason(e.target.value)} />

          {error && (
            <div className="text-xs text-rust bg-rust/10 border border-rust/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !quantity}>
              {saving ? "Saving..." : "Record Movement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
