const express = require("express");
const {
  getAllEvents,
  getEventById,
  createEvent,
  deleteEvent,
  getEventMembers,
  joinEvent,
  removeMember,
  getEventsByUserId,
} = require("../controllers/events.controller");

const { verifyToken } = require("../middleware/auth");

const eventsRouter = express.Router();

eventsRouter.get("/", verifyToken, getAllEvents);
eventsRouter.get("/:event_id", verifyToken, getEventById);
eventsRouter.post("/", verifyToken, createEvent);
eventsRouter.delete("/:event_id", verifyToken, deleteEvent);
eventsRouter.get("/:event_id/members", verifyToken, getEventMembers);
eventsRouter.post("/:event_id/members", verifyToken, joinEvent);
eventsRouter.delete("/:event_id/members/:user_id", verifyToken, removeMember);
eventsRouter.get("/user/:user_id", verifyToken, getEventsByUserId);

module.exports = eventsRouter;
