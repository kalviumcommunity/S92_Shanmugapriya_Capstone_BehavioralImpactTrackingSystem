const jwt = require("jsonwebtoken");
const {
  canAccessResource,
  createToken,
  getBearerToken,
  publicUser,
  verifyToken,
} = require("../utils/auth");

const secret = "test-secret";

 describe("auth helpers", () => {
  test("publicUser excludes the password", () => {
    const user = publicUser({
      _id: "user-1",
      username: "priya",
      name: "Priya",
      email: "priya@example.com",
      role: "user",
      password: "hidden",
    });

    expect(user).toEqual({
      id: "user-1",
      username: "priya",
      name: "Priya",
      email: "priya@example.com",
      role: "user",
    });
    expect(user.password).toBeUndefined();
  });

  test("createToken includes the user identity and role", () => {
    const token = createToken({ _id: "user-2", username: "admin", role: "admin" }, secret);
    expect(verifyToken(token, secret)).toMatchObject({
      userId: "user-2",
      username: "admin",
      role: "admin",
    });
  });

  test("createToken expires after one hour", () => {
    const token = createToken({ _id: "user-3", username: "member", role: "user" }, secret);
    const decoded = jwt.decode(token);
    expect(decoded.exp - decoded.iat).toBe(60 * 60);
  });

  test("getBearerToken extracts a bearer token", () => {
    expect(getBearerToken("Bearer abc123")).toBe("abc123");
  });

  test("getBearerToken rejects missing or malformed authorization", () => {
    expect(getBearerToken()).toBeNull();
    expect(getBearerToken("Basic abc123")).toBeNull();
  });

  test("resource access allows owners and admins only", () => {
    expect(canAccessResource("user-1", { userId: "user-1", role: "user" })).toBe(true);
    expect(canAccessResource("user-1", { userId: "user-2", role: "user" })).toBe(false);
    expect(canAccessResource("user-1", { userId: "user-2", role: "admin" })).toBe(true);
  });
});
