const Router = require('express')
const router = new Router()

const scanController = require("../controllers/scan-controller")
const authMiddleware = require("../middleware/auth-middleware")

router.post("/scan", authMiddleware, scanController.scanCode.bind(scanController))

module.exports = router
