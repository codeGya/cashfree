import React, { useEffect, useState } from "react";
import RoleHeader from "./components/RoleHeader";
import CreateTicket from "./components/CreateTicket";
import TicketItem from "./components/TicketItem";

const API_BASE =  "http://localhost:4000/api";

export default function App() {
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState([]);

  async function load() {
    const res = await fetch(`${API_BASE}/tickets`, {
      headers: { "x-user-role": role, "x-user-email": email }
    });
    const data = await res.json();
    setTickets(data);
  }

  useEffect(() => {
    load();
  }, [role]);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>Simple Ticketing Demo</h2>
      <RoleHeader role={role} setRole={setRole} email={email} setEmail={setEmail} />
      <CreateTicket role={role} email={email} onCreated={load} />
      <div>
        <h3>Tickets</h3>
        <button onClick={load}>Refresh</button>
        <div style={{ marginTop: 12 }}>
          {tickets.map(t => (
            <TicketItem key={t._id} t={t} role={role} email={email} onAction={load} />
          ))}
        </div>
      </div>
    </div>
  );
}
