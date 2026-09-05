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

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection failed:", error));

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("Behavioral Impact Tracking System API is running");
});

// ================= API INFO =================
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Behavioral Impact Tracking System API",
    endpoints: [
      "POST /api/users",
      "POST /api/behaviors",
      "GET /api/users",
      "GET /api/users/:id/behaviors",
      "GET /api/users/:id",
      "GET /api/behaviors",
      "GET /api/behaviors/:id",
      "PUT /api/users/:id",
      "PUT /api/behaviors/:id",
    ],
  });
});

// ================= CREATE USER =================
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// ================= GET ALL USERS =================
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// =====================================================
// GET USER WITH THEIR BEHAVIORS
// One User → Many Behaviors
// IMPORTANT: Specific route comes BEFORE /api/users/:id
// =====================================================
app.get("/api/users/:id/behaviors", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const behaviors = await Behavior.find({
      userId: req.params.id,
    });

    res.status(200).json({
      user,
      behaviors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user behaviors",
      error: error.message,
    });
  }
});

// ================= GET USER BY ID =================
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// ================= UPDATE USER =================
app.put("/api/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// ================= CREATE BEHAVIOR =================
app.post("/api/behaviors", async (req, res) => {
  try {
    const { userId, behaviorType, description, impactScore } = req.body;

    if (!userId || !behaviorType || !description) {
      return res.status(400).json({
        message: "userId, behaviorType and description are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found. Cannot create behavior.",
      });
    }

    const behavior = await Behavior.create({
      userId,
      behaviorType,
      description,
      impactScore,
    });

    res.status(201).json({
      message: "Behavior created successfully and linked to user",
      behavior,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create behavior",
      error: error.message,
    });
  }
});

// ================= GET ALL BEHAVIORS =================
app.get("/api/behaviors", async (req, res) => {
  try {
    const behaviors = await Behavior.find().populate(
      "userId",
      "name email role"
    );

    res.status(200).json(behaviors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch behaviors",
      error: error.message,
    });
  }
});

// ================= GET BEHAVIOR BY ID =================
app.get("/api/behaviors/:id", async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id).populate(
      "userId",
      "name email role"
    );

    if (!behavior) {
      return res.status(404).json({
        message: "Behavior not found",
      });
    }

    res.status(200).json(behavior);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch behavior",
      error: error.message,
    });
  }
});

// ================= UPDATE BEHAVIOR =================
app.put("/api/behaviors/:id", async (req, res) => {
  try {
    const updatedBehavior = await Behavior.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBehavior) {
      return res.status(404).json({
        message: "Behavior not found",
      });
    }

    res.status(200).json({
      message: "Behavior updated successfully",
      behavior: updatedBehavior,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update behavior",
      error: error.message,
    });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});