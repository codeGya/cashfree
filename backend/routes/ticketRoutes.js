import express from "express";
import {
  createTicket,
  getTickets,
  ticketDecision,
  issueRefund,
  closeTicket,
  escalateTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/tickets", createTicket);
router.get("/tickets", getTickets);
router.post("/tickets/:id/decision", ticketDecision);
router.post("/tickets/:id/refund", issueRefund);
router.post("/tickets/:id/close", closeTicket);
router.post("/tickets/:id/escalate", escalateTicket); // 👈 new endpoint

export default router;
