const jwt = require("jsonwebtoken");

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user, secret) => jwt.sign(
  {
    userId: user._id.toString(),
    username: user.username,
    role: user.role,
  },
  secret,
  { expiresIn: "1h" },
);

const getBearerToken = (authorization = "") => (
  authorization.startsWith("Bearer ") ? authorization.slice(7) : null
);

const verifyToken = (token, secret) => jwt.verify(token, secret);

const canAccessResource = (resourceUserId, auth) => (
  resourceUserId.toString() === auth.userId || auth.role === "admin"
);

module.exports = {
  canAccessResource,
  createToken,
  getBearerToken,
  publicUser,
  verifyToken,
};
