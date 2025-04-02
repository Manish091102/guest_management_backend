const express = require("express");
const {
  createEvent,
  getEvents,
  updateEvent,
  getEventsByUser,
  deleteEvent
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createEvent);
router.get("/user", authMiddleware, getEventsByUser);
router.get("/", authMiddleware, getEvents);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;
