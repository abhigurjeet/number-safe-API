const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const authenticateToken = require("../middlewares/authenticationMiddleware");

router.post("/login", contactController.loginUser);
router.post("/register", contactController.registerUser);
router.get(
  "/user/:phoneNumber",
  authenticateToken,
  contactController.getUserByNumber
);
router.get(
  "/users/:name",
  authenticateToken,
  contactController.getUsersByNames
);
router.patch(
  "/reportSpam/:phoneNumber",
  authenticateToken,
  contactController.reportSpamUser
);
module.exports = router;
