const Router = require('express')
const router = new Router()

const scanController = require("../controllers/scan-controller")
const loggerScansController = require("../controllers/logger-scan-controller")
const checkShiftMiddleware = require('../middleware/auth-middleware')

router.post("/scan", checkShiftMiddleware, scanController.scanCode.bind(scanController))

module.exports = router
