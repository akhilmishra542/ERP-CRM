import { NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "◆" },
  { to: "/customers", label: "Customers", icon: "☰" },
  { to: "/products", label: "Products", icon: "▤" },
  { to: "/challans", label: "Challans", icon: "▥" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      <aside className="w-60 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="font-display text-xl font-semibold tracking-tight text-white">
            Ledger<span className="text-brand-400">.</span>Ops
          </div>
          <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">
            ERP + CRM Portal
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="text-base leading-none w-4 text-center opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <div className="text-sm text-white font-medium truncate">{user?.name}</div>
          <div className="text-[11px] uppercase tracking-widest text-brand-400 mt-0.5">
            {user?.role}
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-white/50 hover:text-white transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
