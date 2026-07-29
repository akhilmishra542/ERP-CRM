import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { customerApi } from "../api";
import { Customer } from "../types";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import CustomerFormModal from "../components/CustomerFormModal";

export default function Customers() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [showModal, setShowModal] = useState(false);

  const canEdit = user?.role === "ADMIN" || user?.role === "SALES";

  async function load() {
    setLoading(true);
    try {
      const res = await customerApi.list({
        page,
        limit: 15,
        search: search || undefined,
        status: status || undefined,
      });
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage leads, active accounts, and follow-ups."
        action={
          canEdit && (
            <Button onClick={() => setShowModal(true)}>+ New Customer</Button>
          )
        }
      />

      <div className="flex gap-3 mb-5">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <Input
            placeholder="Search by name, mobile, business, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setSearchParams(e.target.value ? { status: e.target.value } : {});
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" subtitle="Try adjusting your search or filters." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-ink/40">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <Link to={`/customers/${c.id}`} className="font-medium text-ink hover:text-brand-600">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono-num text-ink/70">{c.mobile}</td>
                  <td className="px-5 py-3 text-ink/70">{c.businessName || "—"}</td>
                  <td className="px-5 py-3">
                    <Badge>{c.customerType}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{c.status}</Badge>
                  </td>
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
        <CustomerFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}
