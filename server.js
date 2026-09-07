const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const Behavior = require("./models/Behavior");
const User = require("./models/User");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user) => jwt.sign(
  { userId: user._id, username: user.username, role: user.role },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

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
      "POST /api/auth/register",
      "POST /api/auth/login",
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

// ================= REGISTER =================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const existingUser = await User.findOne({ username: username.trim() });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        ...publicUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ================= LOGIN =================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = createToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        ...publicUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// ================= CREATE USER =================
app.post("/api/users", requireAuth, async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const user = await User.create({
      username: username.trim(),
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: publicUser(user),
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// ================= GET ALL USERS =================
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// ================= GET USER WITH THEIR BEHAVIORS =================
app.get("/api/users/:id/behaviors", requireAuth, async (req, res) => {
  try {
    if (req.auth.userId !== req.params.id && req.auth.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own behaviors" });
    }

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
app.get("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(publicUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// ================= UPDATE USER =================
app.put("/api/users/:id", requireAuth, async (req, res) => {
  try {
    if (req.auth.userId !== req.params.id && req.auth.role !== "admin") {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, email: req.body.email },
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
      user: publicUser(updatedUser),
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// ================= CREATE BEHAVIOR =================
app.post("/api/behaviors", requireAuth, async (req, res) => {
  try {
    const { behaviorType, description, impactScore } = req.body;
    const userId = req.auth.userId;

    if (!behaviorType || !description) {
      return res.status(400).json({
        message: "behaviorType and description are required",
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
app.get("/api/behaviors", requireAuth, async (req, res) => {
  try {
    const filter = req.auth.role === "admin" ? {} : { userId: req.auth.userId };
    const behaviors = await Behavior.find(filter).populate(
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
app.get("/api/behaviors/:id", requireAuth, async (req, res) => {
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

    if (behavior.userId._id.toString() !== req.auth.userId && req.auth.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own behaviors" });
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
app.put("/api/behaviors/:id", requireAuth, async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id);

    if (!behavior) return res.status(404).json({ message: "Behavior not found" });
    if (behavior.userId.toString() !== req.auth.userId && req.auth.role !== "admin") {
      return res.status(403).json({ message: "You can only update your own behaviors" });
    }

    const updatedBehavior = await Behavior.findByIdAndUpdate(req.params.id, {
      behaviorType: req.body.behaviorType,
      description: req.body.description,
      impactScore: req.body.impactScore,
    }, { new: true, runValidators: true });

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

// ================= DELETE BEHAVIOR =================
app.delete("/api/behaviors/:id", requireAuth, async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id);

    if (!behavior) return res.status(404).json({ message: "Behavior not found" });
    if (behavior.userId.toString() !== req.auth.userId && req.auth.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own behaviors" });
    }

    await behavior.deleteOne();
    res.json({ message: "Behavior deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete behavior", error: error.message });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.auth.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
});