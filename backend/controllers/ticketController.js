import Ticket from "../models/Ticket.js";
import { sendMail } from "../utils/mailer.js";

export const createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    const allRecipients = [
      ticket.customerEmail,
      process.env.ADMIN_EMAIL,
      process.env.APPROVER1_EMAIL,
      process.env.APPROVER2_EMAIL,
    ];

    sendMail(
      allRecipients,
      "New Ticket Created",
      `Ticket created: ${ticket.description}`
    );
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (_, res) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  res.json(tickets);
};

export const escalateTicket = async (req, res) => {
  const { id } = req.params;
  const role = req.headers["x-user-role"];

  try {
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (role === "approver1") {
      ticket.currentApprover = "approver2";
      ticket.status = "EscalatedToApprover2";
    } else if (role === "approver2") {
      ticket.currentApprover = "admin";
      ticket.status = "EscalatedToAdmin";
    } else {
      return res
        .status(403)
        .json({ message: "You are not allowed to escalate this ticket" });
    }

    await ticket.save();

    sendMail(
      [process.env.ADMIN_EMAIL, process.env.APPROVER2_EMAIL],
      "Ticket Escalated",
      `Ticket ${ticket._id} has been escalated by ${role}.`
    );

    res.json({ message: "Ticket escalated successfully", ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers["x-user-role"];

    if (role !== "admin")
      return res.status(403).json({ message: "Only admin can close tickets" });

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status: "Closed" },
      { new: true }
    );

    res.json({ message: "Ticket closed successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const issueRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency } = req.body;
    const role = req.headers["x-user-role"];

    if (role !== "admin")
      return res.status(403).json({ message: "Only admin can issue refunds" });

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = "RefundIssued";
    ticket.refund = { amount, currency, txId: `TXN-${Date.now()}` };

    await ticket.save();

    res.json({ message: "Refund issued successfully", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const ticketDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    const role = req.headers["x-user-role"];
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (role === "approver1" && ["Pending"].includes(ticket.status)) {
      if (action === "accept") ticket.status = "Approved";
      else if (action === "reject") ticket.status = "Rejected";
    } else if (
      role === "approver2" &&
      ["Pending", "EscalatedToApprover2"].includes(ticket.status)
    ) {
      if (action === "accept") ticket.status = "Approved";
      else if (action === "reject") ticket.status = "Rejected";
    } else if (
      role === "admin" &&
      ["Pending", "EscalatedToApprover2", "EscalatedToAdmin"].includes(
        ticket.status
      )
    ) {
      if (action === "accept") ticket.status = "Approved";
      else if (action === "reject") ticket.status = "Rejected";
    } else {
      return res
        .status(403)
        .json({ message: "You cannot take action on this ticket" });
    }

    ticket.notes.push(`${role} - ${action}: ${note || ""}`);
    await ticket.save();

    const allRecipients = [
      ticket.customerEmail,
      process.env.ADMIN_EMAIL,
      process.env.APPROVER1_EMAIL,
      process.env.APPROVER2_EMAIL,
    ];
    sendMail(
      allRecipients,
      `Ticket ${action}`,
      `Ticket ${ticket._id} was ${action}`
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
