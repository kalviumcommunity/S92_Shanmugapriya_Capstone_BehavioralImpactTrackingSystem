const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");

require("dotenv").config();

// Use Google DNS for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Behavior = require("./models/Behavior");
const User = require("./models/User");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// ================= JWT CONFIG CHECK =================
if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env file");
  process.exit(1);
}

// ================= HELPER FUNCTIONS =================

// Remove password before sending user details
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  role: user.role,
});

// Create JWT token
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

// ================= JWT AUTHORIZATION MIDDLEWARE =================

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization || "";

  // Check Bearer token
  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Please provide a Bearer token.",
    });
  }

  const token = authorization.slice(7);

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Store authenticated user information
    req.auth = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ================= MONGODB CONNECTION =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
  res.send("Behavioral Impact Tracking System API is running");
});

// ================= API INFORMATION =================

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Behavioral Impact Tracking System API",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "POST /api/users",
      "GET /api/users",
      "GET /api/users/:id",
      "PUT /api/users/:id",
      "GET /api/users/:id/behaviors",
      "POST /api/behaviors",
      "GET /api/behaviors",
      "GET /api/behaviors/:id",
      "PUT /api/behaviors/:id",
      "DELETE /api/behaviors/:id",
    ],
  });
});

// =====================================================
//                    AUTH ROUTES
// =====================================================

// ================= REGISTER =================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const existingUser = await User.findOne({
      username: username.trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      password: hashedPassword,
      name,
      email,
      role: role || "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: publicUser(user),
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

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Create JWT token
    const token = createToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// ================= CURRENT LOGGED-IN USER =================

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// =====================================================
//                    USER ROUTES
// =====================================================

// ================= CREATE USER =================

app.post("/api/users", requireAuth, async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const existingUser = await User.findOne({
      username: username.trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      name,
      email,
      password: hashedPassword,
      role: role || "user",
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

// ================= GET USER BY ID =================

app.get("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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
    // User can update only their own profile
    if (
      req.auth.userId !== req.params.id &&
      req.auth.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only update your own profile",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
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

// ================= GET USER BEHAVIORS =================

app.get(
  "/api/users/:id/behaviors",
  requireAuth,
  async (req, res) => {
    try {
      // Normal user can view only their own behaviors
      if (
        req.auth.userId !== req.params.id &&
        req.auth.role !== "admin"
      ) {
        return res.status(403).json({
          message: "You can only view your own behaviors",
        });
      }

      const user = await User.findById(req.params.id).select(
        "-password"
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const behaviors = await Behavior.find({
        userId: req.params.id,
      });

      res.status(200).json({
        user: publicUser(user),
        behaviors,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user behaviors",
        error: error.message,
      });
    }
  }
);

// =====================================================
//                  BEHAVIOR ROUTES
// =====================================================

// ================= CREATE BEHAVIOR =================

app.post("/api/behaviors", requireAuth, async (req, res) => {
  try {
    const { behaviorType, description, impactScore } = req.body;

    if (!behaviorType || !description) {
      return res.status(400).json({
        message: "behaviorType and description are required",
      });
    }

    const userId = req.auth.userId;

    const behavior = await Behavior.create({
      userId,
      behaviorType,
      description,
      impactScore,
    });

    res.status(201).json({
      message: "Behavior created successfully",
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
    // Admin can see all behaviors
    // Normal user can see only their behaviors
    const filter =
      req.auth.role === "admin"
        ? {}
        : { userId: req.auth.userId };

    const behaviors = await Behavior.find(filter).populate(
      "userId",
      "username name email role"
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
    const behavior = await Behavior.findById(
      req.params.id
    ).populate(
      "userId",
      "username name email role"
    );

    if (!behavior) {
      return res.status(404).json({
        message: "Behavior not found",
      });
    }

    // Authorization check
    if (
      behavior.userId._id.toString() !== req.auth.userId &&
      req.auth.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only view your own behaviors",
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

app.put("/api/behaviors/:id", requireAuth, async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id);

    if (!behavior) {
      return res.status(404).json({
        message: "Behavior not found",
      });
    }

    // Authorization check
    if (
      behavior.userId.toString() !== req.auth.userId &&
      req.auth.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only update your own behaviors",
      });
    }

    const updatedBehavior =
      await Behavior.findByIdAndUpdate(
        req.params.id,
        {
          behaviorType: req.body.behaviorType,
          description: req.body.description,
          impactScore: req.body.impactScore,
        },
        {
          new: true,
          runValidators: true,
        }
      );

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

app.delete(
  "/api/behaviors/:id",
  requireAuth,
  async (req, res) => {
    try {
      const behavior = await Behavior.findById(
        req.params.id
      );

      if (!behavior) {
        return res.status(404).json({
          message: "Behavior not found",
        });
      }

      // Authorization check
      if (
        behavior.userId.toString() !== req.auth.userId &&
        req.auth.role !== "admin"
      ) {
        return res.status(403).json({
          message: "You can only delete your own behaviors",
        });
      }

      await behavior.deleteOne();

      res.status(200).json({
        message: "Behavior deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to delete behavior",
        error: error.message,
      });
    }
  }
);

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ================= GOOGLE SIGN-IN =================

app.post("/api/auth/google", async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(503).json({ message: "Google authentication is not configured" });
    }

    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential is required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ message: "Google account could not be verified" });
    }

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) user = await User.findOne({ email: payload.email.toLowerCase() });

    if (user) {
      user.googleId = payload.sub;
      user.authProvider = "google";
      user.name = user.name || payload.name;
      await user.save();
    } else {
      const baseUsername = (payload.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "googleuser").slice(0, 20);
      user = await User.create({
        username: `${baseUsername}_${payload.sub.slice(-6)}`,
        name: payload.name || baseUsername,
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        authProvider: "google",
        role: "user",
      });
    }

    res.status(200).json({
      message: "Google login successful",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed", error: error.message });
  }
});