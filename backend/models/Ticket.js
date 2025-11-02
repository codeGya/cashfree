import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  productId: String,
  description: String,

  status: {
    type: String,
    enum: [
      "Pending",
      "Approved",
      "Rejected",
      "EscalatedToApprover2",
      "EscalatedToAdmin",
      "Closed",
      "Refunded",
      "RefundIssued",
    ],
    default: "Pending",
  },

  currentApprover: {
    type: String,
    default: "approver1",
  },

  notes: [String],
  refund: {
    amount: { type: Number },
    currency: { type: String },
    txId: { type: String },
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ticket", ticketSchema);
