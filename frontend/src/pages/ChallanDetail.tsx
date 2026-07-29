import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { challanApi } from "../api";
import { getApiErrorMessage } from "../api/client";
import { Challan } from "../types";
import { Badge, Button, Card, PageHeader, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function ChallanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const canAct = user?.role === "ADMIN" || user?.role === "SALES" || user?.role === "WAREHOUSE";

  async function load() {
    if (!id) return;
    setLoading(true);
    const res = await challanApi.get(id);
    setChallan(res.data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleConfirm() {
    if (!id) return;
    setError("");
    setActionLoading(true);
    try {
      await challanApi.confirm(id);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    if (!window.confirm("Cancel this challan? If confirmed, stock will be restored.")) return;
    setError("");
    setActionLoading(true);
    try {
      await challanApi.cancel(id);
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Spinner />;
  if (!challan) return <div>Challan not found.</div>;

  const money = (v: string | number) => `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const total = challan.items.reduce((sum, it) => sum + Number(it.unitPrice) * it.quantity, 0);

  return (
    <div>
      <Link to="/challans" className="text-xs text-ink/40 hover:text-ink mb-4 inline-block">
        ← Back to challans
      </Link>
      <PageHeader
        title={challan.challanNumber}
        subtitle={challan.customer?.name}
        action={<Badge>{challan.status}</Badge>}
      />

      {error && (
        <div className="mb-5 text-sm text-rust bg-rust/10 border border-rust/30 rounded px-4 py-3">
          {error}
        </div>
      )}

      <Card className="p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 font-medium">SKU</th>
              <th className="py-2 font-medium text-right">Unit Price</th>
              <th className="py-2 font-medium text-right">Qty</th>
              <th className="py-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((it) => (
              <tr key={it.id} className="border-b border-black/5 last:border-0">
                <td className="py-3">{it.productName}</td>
                <td className="py-3 font-mono-num text-ink/60">{it.productSku}</td>
                <td className="py-3 text-right font-mono-num">{money(it.unitPrice)}</td>
                <td className="py-3 text-right font-mono-num">{it.quantity}</td>
                <td className="py-3 text-right font-mono-num font-medium">
                  {money(Number(it.unitPrice) * it.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="py-3 text-right text-sm font-medium text-ink/60">
                Total
              </td>
              <td className="py-3 text-right font-mono-num font-semibold text-base">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-xs text-ink/40">
          Created {new Date(challan.createdAt).toLocaleString()}
          {challan.createdBy?.name ? ` by ${challan.createdBy.name}` : ""}
        </div>
        {canAct && challan.status !== "CANCELLED" && (
          <div className="flex gap-2">
            {challan.status === "DRAFT" && (
              <Button disabled={actionLoading} onClick={handleConfirm}>
                {actionLoading ? "Confirming..." : "Confirm & Reduce Stock"}
              </Button>
            )}
            <Button variant="danger" disabled={actionLoading} onClick={handleCancel}>
              {actionLoading ? "Cancelling..." : "Cancel Challan"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
