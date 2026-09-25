import { verifyToken } from "../utils/auth.js";

function authMiddleware(role) {
  return (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      const error = new Error("sign in required");
      error.statusCode = 401;
      return next(error);
    }

    const token = authorization.slice(7);

    try {
      req.user = verifyToken(token);
    } catch {
      const error = new Error("invalid or expired token");
      error.statusCode = 401;
      return next(error);
    }

    if (role && req.user.role !== role) {
      const error = new Error(`${role} only`);
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
}

export default authMiddleware;