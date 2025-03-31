// // backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSecret");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { authenticate };
