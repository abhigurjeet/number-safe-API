const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(
    token,
    process.env.SECRET_KEY,
    { algorithm: "HS256" },
    (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    }
  );
}

module.exports = authenticateToken;
