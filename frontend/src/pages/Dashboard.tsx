import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { customerApi, productApi, challanApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { Card, PageHeader, Spinner, Badge } from "../components/ui";
import { Challan, Product } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ customers: 0, products: 0, challans: 0, leads: 0 });
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [customersRes, productsRes, challansRes, leadsRes, lowStockRes] = await Promise.all([
          customerApi.list({ limit: 1 }),
          productApi.list({ limit: 1 }),
          challanApi.list({ limit: 5 }),
          customerApi.list({ limit: 1, status: "LEAD" }),
          productApi.list({ limit: 5, lowStock: true }),
        ]);
        setStats({
          customers: customersRes.data.pagination.total,
          products: productsRes.data.pagination.total,
          challans: challansRes.data.pagination.total,
          leads: leadsRes.data.pagination.total,
        });
        setRecentChallans(challansRes.data.data);
        setLowStock(lowStockRes.data.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;

  const cards = [
    { label: "Customers", value: stats.customers, to: "/customers" },
    { label: "Open Leads", value: stats.leads, to: "/customers?status=LEAD" },
    { label: "Products", value: stats.products, to: "/products" },
    { label: "Challans", value: stats.challans, to: "/challans" },
  ];

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0]}`} subtitle="Here's what's happening across operations today." />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link to={c.to} key={c.label}>
            <Card className="p-5 hover:border-brand-500/40 transition-colors">
              <div className="text-3xl font-display font-semibold text-ink">{c.value}</div>
              <div className="text-xs uppercase tracking-widest text-ink/40 mt-1">{c.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Recent Challans</h3>
            <Link to="/challans" className="text-xs text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {recentChallans.length === 0 ? (
            <div className="text-sm text-ink/40 py-4">No challans yet.</div>
          ) : (
            <div className="space-y-3">
              {recentChallans.map((c) => (
                <Link
                  key={c.id}
                  to={`/challans/${c.id}`}
                  className="flex items-center justify-between py-2 border-b border-black/5 last:border-0 hover:bg-black/[0.02] -mx-2 px-2 rounded"
                >
                  <div>
                    <div className="text-sm font-medium font-mono-num">{c.challanNumber}</div>
                    <div className="text-xs text-ink/40">{c.customer?.name}</div>
                  </div>
                  <Badge>{c.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Low Stock Alerts</h3>
            <Link to="/products" className="text-xs text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-sm text-ink/40 py-4">All stock levels are healthy.</div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  to={`/products`}
                  className="flex items-center justify-between py-2 border-b border-black/5 last:border-0 hover:bg-black/[0.02] -mx-2 px-2 rounded"
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-ink/40 font-mono-num">{p.sku}</div>
                  </div>
                  <div className="text-sm font-mono-num text-rust font-semibold">
                    {p.currentStock} left
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
