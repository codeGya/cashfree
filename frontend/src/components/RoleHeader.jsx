import React from "react";

export default function RoleHeader({ role, setRole, email, setEmail }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
      <label>
        Role:
        <select value={role} onChange={e => setRole(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="customer">customer</option>
          <option value="approver1">approver1</option>
          <option value="approver2">approver2</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <label>
        Email:
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ marginLeft: 8 }}
        />
      </label>
    </div>
  );
}
