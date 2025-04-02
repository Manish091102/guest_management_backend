const express = require("express");
const { register, login, verifyOtpAndRegister } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/login", login);

module.exports = router;
