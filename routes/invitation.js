const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendInvitation, updateInvitationStatus, getInvitationsByEvent } = require("../controllers/invitationController");

const router = express.Router();

router.post("/send", authMiddleware, sendInvitation);
router.patch("/invitation/:invitationId", updateInvitationStatus);
router.get("/list/:eventId", getInvitationsByEvent);

module.exports = router;
