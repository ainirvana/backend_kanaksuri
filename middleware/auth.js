// // backend/middleware/auth.js
// const jwt = require('jsonwebtoken');

// /**
//  * Authentication middleware to verify a JWT token.
//  * The token is expected to be passed in the Authorization header in the format: "Bearer <token>".
//  * If verified, the decoded payload (which should include the user’s id and role) is attached to req.user.
//  */
// const authenticate = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSecret");
//     req.user = decoded; // decoded should include properties like _id and role
//     next();
//   } catch (err) {
//     console.error("Token verification error:", err);
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

// module.exports = { authenticate };


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
