
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to continue.",
    });
  }

  const token = authorization.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is missing from server/.env");
    return res.status(500).json({
      message: "Server authentication is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

export function requireEmployer(req, res, next) {
  if (req.user?.role !== "employer") {
    return res.status(403).json({
      message: "Only employers can perform this action.",
    });
  }

  next();
}
