const express = require("express");
const router = express.Router();
const { getDailyReport } = require("../controllers/reportController");
const { authenticateToken, isAdmin } = require("../middleware/permissionMiddleware");

router.get("/daily", authenticateToken, isAdmin, getDailyReport);

module.exports = router;
