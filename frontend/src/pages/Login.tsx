import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../api/client";
import { Button, Input } from "../components/ui";

const demoLogins = [
  { role: "Admin", email: "admin@erp.com" },
  { role: "Sales", email: "sales@erp.com" },
  { role: "Warehouse", email: "warehouse@erp.com" },
  { role: "Accounts", email: "accounts@erp.com" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@erp.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-semibold text-white tracking-tight">
            Ledger<span className="text-brand-400">.</span>Ops
          </div>
          <div className="text-xs uppercase tracking-widest text-white/40 mt-2">
            ERP + CRM Operations Portal
          </div>
        </div>

        <div className="bg-paper rounded-lg p-7 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="text-xs text-rust bg-rust/10 border border-rust/30 rounded px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <div className="text-[11px] uppercase tracking-widest text-white/30 mb-2">
            Demo credentials — password: Password123!
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {demoLogins.map((d) => (
              <button
                key={d.email}
                onClick={() => {
                  setEmail(d.email);
                  setPassword("Password123!");
                }}
                className="text-[11px] px-2.5 py-1 rounded-sm border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
              >
                {d.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
