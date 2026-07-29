import { FormEvent, useState } from "react";
import { customerApi } from "../api";
import { getApiErrorMessage } from "../api/client";
import { Customer } from "../types";
import { Button, Input, Select, Textarea } from "./ui";

export default function CustomerFormModal({
  customer,
  onClose,
  onSaved,
}: {
  customer?: Customer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    mobile: customer?.mobile || "",
    email: customer?.email || "",
    businessName: customer?.businessName || "",
    gstNumber: customer?.gstNumber || "",
    customerType: customer?.customerType || "RETAIL",
    address: customer?.address || "",
    status: customer?.status || "LEAD",
    followUpDate: customer?.followUpDate ? customer.followUpDate.slice(0, 10) : "",
    notes: customer?.notes || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, followUpDate: form.followUpDate || undefined };
      if (customer) {
        await customerApi.update(customer.id, payload);
      } else {
        await customerApi.create(payload);
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
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-black/10">
          <h2 className="font-display text-lg font-semibold">
            {customer ? "Edit Customer" : "New Customer"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            <Input
              label="Mobile"
              required
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="Business Name"
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GST Number (optional)"
              value={form.gstNumber}
              onChange={(e) => update("gstNumber", e.target.value)}
            />
            <Select
              label="Customer Type"
              value={form.customerType}
              onChange={(e) => update("customerType", e.target.value as any)}
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => update("status", e.target.value as any)}>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
            <Input
              label="Follow-up Date"
              type="date"
              value={form.followUpDate}
              onChange={(e) => update("followUpDate", e.target.value)}
            />
          </div>
          <Textarea
            label="Address"
            rows={2}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <Textarea
            label="Notes"
            rows={2}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />

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
              {saving ? "Saving..." : customer ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
