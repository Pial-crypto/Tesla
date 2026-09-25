import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
    },
    SECRET,
    {
      expiresIn: "12h",
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export { signToken, verifyToken };