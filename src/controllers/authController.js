import bcrypt from "bcryptjs";
import Family from "../models/Family.js";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export async function signup(req, res) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, username, and password are required." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const family = await Family.create({ name: `${username}'s Family` });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, username, passwordHash, family: family._id });

  const token = signToken(user._id);
  res.status(201).json({ token, user });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user._id);
  res.json({ token, user });
}
