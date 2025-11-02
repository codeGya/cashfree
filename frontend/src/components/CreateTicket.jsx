import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:4000/api";

export default function CreateTicket({ role, email, onCreated }) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    productId: "",
    description: "",
  });

  useEffect(() => {
    if (role === "customer") {
      setForm((f) => ({ ...f, customerEmail: email }));
    }
  }, [role, email]);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": role,
        "x-user-email": email,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      onCreated && onCreated();
      setForm({
        customerName: "",
        customerEmail: email,
        productId: "",
        description: "",
      });
      alert("Ticket created");
    } else {
      alert(data.message || "Error creating ticket");
    }
  }

  if (role !== "customer") {
    return null;
  }

  return (
    <form
      onSubmit={submit}
      style={{ border: "1px solid #eee", padding: 12, marginBottom: 12 }}
    >
      <h3>Create Ticket</h3>
      <input
        required
        placeholder="Customer name"
        value={form.customerName}
        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
      />
      <input
        required
        placeholder="Customer email"
        value={form.customerEmail}
        onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
      />
      <input
        placeholder="Product ID"
        value={form.productId}
        onChange={(e) => setForm({ ...form, productId: e.target.value })}
      />
      <textarea
        required
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <button type="submit">Create</button>
    </form>
  );
}


