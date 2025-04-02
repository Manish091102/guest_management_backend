const Event = require("../models/Event");

// Create Event
exports.createEvent = async (req, res) => {
    try {
      const { name, date, time, location } = req.body;
      const userId = req.user.id;
  
      const newEvent = new Event({
        name,
        date,
        time,
        location,
        createdBy: userId,
      });
  
      await newEvent.save();
      res.status(201).json({ message: "Event created successfully!", event: newEvent });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  };

// Get All Events
exports.getEvents = async (req, res) => {
    try {
      const events = await Event.find().populate("createdBy", "name email"); // Fetch event with user details
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  };
  
  // Get Events by User ID (Token-Based)
exports.getEventsByUser = async (req, res) => {
    try {
      const userId = req.user.id; // Extract userId from token
  
      const events = await Event.find({ createdBy: userId });
      
      if (!events.length) {
        return res.status(404).json({ message: "No events found for this user" });
      }
  
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  };
  

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event updated successfully!", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: "Event deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
};
