const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendOTPEmail = require("../utils/emailOtp");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log("Received register request:", req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already registered with this email" });
        }

        // Generate OTP
        const otp = generateOtp();
        console.log(`Generated OTP: ${otp} for email: ${email}`);

        // Store OTP in DB
        await Otp.create({ email, otp, name, password });

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully. Verify to complete registration.", email });

    } catch (error) {
        console.error("Error in register function:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};


exports.verifyOtpAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find OTP entry
        const otpEntry = await Otp.findOne({ email, otp });
        if (!otpEntry) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(otpEntry.password, 10);
        const newUser = new User({ name: otpEntry.name, email, password: hashedPassword });
        await newUser.save();

        await Otp.deleteOne({ email });

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        res.status(500).json({ error: "OTP verification failed" });
    }
};




exports.login = async (req, res) => {
    try {
        console.log("Login request body:", req.body);

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        console.log("User found:", user);

        if (!user) {
            console.log("User not found in the database");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password match:", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });

    } catch (error) {
        console.log("Error during login:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
