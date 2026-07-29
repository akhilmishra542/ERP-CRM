import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { customerApi } from "../api";
import { getApiErrorMessage } from "../api/client";
import { Customer } from "../types";
import { Badge, Button, Card, PageHeader, Spinner, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import CustomerFormModal from "../components/CustomerFormModal";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [error, setError] = useState("");

  const canEdit = user?.role === "ADMIN" || user?.role === "SALES";

  async function load() {
    if (!id) return;
    setLoading(true);
    const res = await customerApi.get(id);
    setCustomer(res.data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!id || !note.trim()) return;
    setAddingNote(true);
    setError("");
    try {
      await customerApi.addFollowUp(id, note.trim());
      setNote("");
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) return <Spinner />;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div>
      <Link to="/customers" className="text-xs text-ink/40 hover:text-ink mb-4 inline-block">
        ← Back to customers
      </Link>
      <PageHeader
        title={customer.name}
        subtitle={customer.businessName || undefined}
        action={
          canEdit && (
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              Edit Customer
            </Button>
          )
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Mobile</dt>
                <dd className="font-mono-num">{customer.mobile}</dd>
              </div>
              <div>
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Email</dt>
                <dd>{customer.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">GST Number</dt>
                <dd className="font-mono-num">{customer.gstNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Type</dt>
                <dd><Badge>{customer.customerType}</Badge></dd>
              </div>
              <div>
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Status</dt>
                <dd><Badge>{customer.status}</Badge></dd>
              </div>
              <div>
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Follow-up Date</dt>
                <dd>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Address</dt>
                <dd>{customer.address || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink/40 text-xs uppercase tracking-wide mb-1">Notes</dt>
                <dd>{customer.notes || "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Recent Challans</h3>
            {!customer.challans || customer.challans.length === 0 ? (
              <div className="text-sm text-ink/40">No challans for this customer yet.</div>
            ) : (
              <div className="space-y-2">
                {customer.challans.map((c) => (
                  <Link
                    key={c.id}
                    to={`/challans/${c.id}`}
                    className="flex items-center justify-between py-2 px-2 -mx-2 rounded hover:bg-black/[0.02] border-b border-black/5 last:border-0"
                  >
                    <span className="font-mono-num text-sm">{c.challanNumber}</span>
                    <Badge>{c.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Follow-up Notes</h3>
            {canEdit && (
              <form onSubmit={handleAddNote} className="mb-4 space-y-2">
                <Textarea
                  rows={3}
                  placeholder="Add a follow-up note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {error && <div className="text-xs text-rust">{error}</div>}
                <Button type="submit" size="sm" disabled={addingNote || !note.trim()}>
                  {addingNote ? "Adding..." : "Add Note"}
                </Button>
              </form>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(customer.followUpNotes || []).length === 0 ? (
                <div className="text-sm text-ink/40">No follow-up notes yet.</div>
              ) : (
                customer.followUpNotes!.map((n) => (
                  <div key={n.id} className="border-b border-black/5 last:border-0 pb-3">
                    <div className="text-sm text-ink/80">{n.note}</div>
                    <div className="text-[11px] text-ink/35 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {showEdit && (
        <CustomerFormModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}
    </div>
  );
}
