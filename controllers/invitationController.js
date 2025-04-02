const Invitation = require("../models/Invitation");
const Event = require("../models/Event");
const nodemailer = require("nodemailer");
require("dotenv").config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Send Invitation Email
const sendInvitationEmail = async (email, invitationId, event) => {
  try {
    const responseLink = `${FRONTEND_URL}/invitation/${invitationId}`;
    
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: `You're Invited to ${event.name}!`,
      text: `You have been invited to ${event.name} on ${event.date} at ${event.location}.
      \nPlease respond to the invitation by clicking the link below:
      ${responseLink}`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Invitation sent to ${email}`);
  } catch (error) {
    console.error("Error sending invitation email:", error);
  }
};

// Send Invitation API (Single & Multiple Emails)
exports.sendInvitation = async (req, res) => {
  try {
    const { eventId, emails } = req.body; // Accepts single or multiple emails
    
    if (!Array.isArray(emails)) {
      return res.status(400).json({ error: "Emails should be an array" });
    }
    
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    const invitations = await Invitation.insertMany(emails.map(email => ({ eventId, email, status: "pending" })));
    
    invitations.forEach(invitation => sendInvitationEmail(invitation.email, invitation._id, event));
    
    res.status(201).json({ message: "Invitations sent successfully!", invitations });
  } catch (error) {
    res.status(500).json({ error: "Failed to send invitations" });
  }
};

exports.updateInvitationStatus = async (req, res) => {
  try {
    console.log("req", req.body);
    const { invitationId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the existing invitation
    const existingInvitation = await Invitation.findById(invitationId);
    if (!existingInvitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Check if the invitation is already accepted/rejected
    if (existingInvitation.status !== "pending") {
      return res.status(400).json({ error: `Invitation already ${existingInvitation.status}` });
    }

    // Update the invitation status
    existingInvitation.status = status;
    await existingInvitation.save();

    res.json({ message: "Invitation status updated successfully!", invitation: existingInvitation });
  } catch (error) {
    res.status(500).json({ error: "Failed to update invitation status" });
  }
};

exports.getInvitationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if the event exists
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Fetch invitations with email and status
    const invitations = await Invitation.find({ eventId }).select("email status");

    // Group by status
    const groupedInvitations = {
      pending: invitations.filter(inv => inv.status === "pending"),
      accepted: invitations.filter(inv => inv.status === "accepted"),
      rejected: invitations.filter(inv => inv.status === "rejected")
    };

    res.json({ invitations: groupedInvitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
};



