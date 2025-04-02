const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event")
const invitationRoutes = require("./routes/invitation")
const bodyParser = require("body-parser");


dotenv.config();

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL];

app.use(cors({
    origin: allowedOrigins, 
    credentials: true 
}));

app.use(express.json());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/invitation", invitationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
