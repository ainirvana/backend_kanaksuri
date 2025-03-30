// // backend/middleware/roleMiddleware.js
// /**
//  * Role-based authorization middleware.
//  * Use it by passing the allowed roles to the function.
//  * For example:
//  *    router.get('/some-route', authenticate, authorizeRoles('master_admin', 'admin'), (req, res) => { ... });
//  */
// const authorizeRoles = (...allowedRoles) => {
//     return (req, res, next) => {
//       if (!req.user || !allowedRoles.includes(req.user.role)) {
//         return res.status(403).json({ error: "Access denied: insufficient permissions" });
//       }
//       next();
//     };
//   };
  
//   module.exports = { authorizeRoles };
  

// // backend/middleware/roleMiddleware.js
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied: insufficient permissions" });
      }
      next();
    };
  };
  
  module.exports = { authorizeRoles };
  