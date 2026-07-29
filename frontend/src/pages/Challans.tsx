import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { challanApi } from "../api";
import { Challan } from "../types";
import { Badge, Button, Card, EmptyState, PageHeader, Select, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Challans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canCreate = user?.role === "ADMIN" || user?.role === "SALES";

  async function load() {
    setLoading(true);
    try {
      const res = await challanApi.list({ page, limit: 15, status: status || undefined });
      setChallans(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        subtitle="Create, confirm, and track outbound challans."
        action={canCreate && <Button onClick={() => navigate("/challans/new")}>+ New Challan</Button>}
      />

      <div className="w-48 mb-5">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : challans.length === 0 ? (
          <EmptyState title="No challans found" subtitle="Create your first sales challan to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-ink/40">
                <th className="px-5 py-3 font-medium">Challan #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total Qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => (
                <tr key={c.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="px-5 py-3">
                    <Link to={`/challans/${c.id}`} className="font-mono-num font-medium text-ink hover:text-brand-600">
                      {c.challanNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{c.customer?.name}</td>
                  <td className="px-5 py-3 font-mono-num">{c.totalQuantity}</td>
                  <td className="px-5 py-3"><Badge>{c.status}</Badge></td>
                  <td className="px-5 py-3 text-ink/50">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
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
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
