import React from "react";

const API_BASE = "http://localhost:4000/api";

export default function TicketItem({ t, role, email, onAction }) {
  async function decision(action) {
    const note = prompt("Optional note") || "";
    const res = await fetch(`${API_BASE}/tickets/${t._id}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": role,
        "x-user-email": email,
      },
      body: JSON.stringify({ action, note }),
    });

    const data = await res.json();
    if (res.ok) {
      onAction();
      alert("Decision submitted successfully");
    } else {
      alert(data.message || "Error submitting decision");
    }
  }

  async function refund() {
    const amt = prompt("Refund amount (number)");
    if (!amt) return;
    const res = await fetch(`${API_BASE}/tickets/${t._id}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": role,
        "x-user-email": email,
      },
      body: JSON.stringify({ amount: Number(amt), currency: "INR" }),
    });
    const data = await res.json();
    if (res.ok) {
      onAction();
      alert("Refund issued successfully");
    } else {
      alert(data.message || "Error issuing refund");
    }
  }

  async function closeTicket() {
    const res = await fetch(`${API_BASE}/tickets/${t._id}/close`, {
      method: "POST",
      headers: {
        "x-user-role": role,
        "x-user-email": email,
      },
    });
    const data = await res.json();
    if (res.ok) {
      onAction();
      alert("Ticket closed successfully");
    } else {
      alert(data.message || "Error closing ticket");
    }
  }

  async function escalate(id, toRole) {
    const res = await fetch(`${API_BASE}/tickets/${id}/escalate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": role,
        "x-user-email": email,
      },
      body: JSON.stringify({ toRole }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Ticket escalated to ${toRole} successfully!`);
      onAction();
    } else {
      alert(data.message || "Error escalating ticket");
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
      <div>
        <strong>#{t._id}</strong> — {t.productId} — <em>{t.status}</em>
      </div>
      <div>
        Customer: {t.customerName} ({t.customerEmail})
      </div>
      <div>{t.description}</div>

      <div style={{ marginTop: 8 }}>
        {role === "approver1" && t.status === "Pending" && (
          <>
            <button onClick={() => decision("accept")}>Accept</button>
            <button onClick={() => decision("reject")}>Reject</button>
            <button onClick={() => escalate(t._id, "approver2")}>
              Escalate to Approver 2
            </button>
          </>
        )}

        {role === "approver2" &&
          (t.status === "Pending" || t.status === "EscalatedToApprover2") && (
            <>
              <button onClick={() => decision("accept")}>Accept</button>
              <button onClick={() => decision("reject")}>Reject</button>
              <button onClick={() => escalate(t._id, "admin")}>
                Escalate to Admin
              </button>
            </>
          )}

        {role === "admin" &&
          (t.status === "Pending" ||
            t.status === "EscalatedToApprover2" ||
            t.status === "EscalatedToAdmin") && (
            <>
              <button onClick={() => decision("accept")}>Accept</button>
              <button onClick={() => decision("reject")}>Reject</button>
              <button onClick={refund}>Refund</button>
              <button onClick={closeTicket}>Close</button>
            </>
          )}
      </div>

      {t.refund && (
        <div style={{ marginTop: 8, color: "green" }}>
          Refunded: {t.refund.amount} {t.refund.currency} Tx: {t.refund.txId}
        </div>
      )}
    </div>
  );
}


