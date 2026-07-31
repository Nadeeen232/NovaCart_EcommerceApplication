import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendConfirmation } from "../utils/mailer.js";
import { protect } from "../middleware/auth.js";
const r = Router();
const tokenFor = (u) =>
  jwt.sign({ sub: u._id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
r.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8)
    return res
      .status(400)
      .json({
        message: "Name, valid email and password of 8+ characters are required",
      });
  if (await User.exists({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "Email already registered" });
  const confirmation = crypto.randomBytes(32).toString("hex");
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    emailConfirmationToken: crypto
      .createHash("sha256")
      .update(confirmation)
      .digest("hex"),
  });
  const devConfirmationUrl = await sendConfirmation(user.email, confirmation);
  res
    .status(201)
    .json({
      message: "Registration successful. Check your email.",
      devConfirmationUrl,
    });
});
r.get("/confirm-email", async (req, res) => {
  const hash = crypto
    .createHash("sha256")
    .update(String(req.query.token || ""))
    .digest("hex");
  const user = await User.findOne({ emailConfirmationToken: hash });
  if (!user)
    return res.status(400).json({ message: "Invalid confirmation token" });
  user.isEmailConfirmed = true;
  user.emailConfirmationToken = undefined;
  await user.save();
  res.json({ message: "Email confirmed. You can now log in." });
});
r.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: String(req.body.email || "").toLowerCase(),
  }).select("+password");
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
    return res.status(401).json({ message: "Invalid credentials" });
  if (!user.isEmailConfirmed)
    return res
      .status(403)
      .json({ message: "Confirm your email before logging in" });
  res.json({
    token: tokenFor(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
r.get("/me", protect, (req, res) => res.json({ user: req.user }));
export default r;
