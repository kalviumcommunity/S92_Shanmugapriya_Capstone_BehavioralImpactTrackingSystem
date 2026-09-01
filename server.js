const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const Behavior = require("./models/Behavior");
const User = require("./models/User");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection failed:", error));

// HOME
app.get("/", (req, res) => {
  res.send("Behavioral Impact Tracking System API is running");
});

// ================= USER WRITE =================
app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      message: "User created successfully",
      user: user
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create user",
      error: error.message
    });
  }
});

// ================= USER READ =================
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
});

// ================= BEHAVIOR WRITE =================
app.post("/api/behaviors", async (req, res) => {
  try {
    const behavior = await Behavior.create(req.body);

    res.status(201).json({
      message: "Behavior created successfully",
      behavior: behavior
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create behavior",
      error: error.message
    });
  }
});

// ================= BEHAVIOR READ =================
app.get("/api/behaviors", async (req, res) => {
  try {
    const behaviors = await Behavior.find().populate("userId");

    res.status(200).json(behaviors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch behaviors",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});