const Router = require('express')
const router = new Router()

const loggerScansController = require("../controllers/logger-scan-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')

router.post("/new",checkShiftMiddleware, loggerScansController.addNew)
router.delete('/clear', checkShiftRoleMiddleware("manager"), loggerScansController.clear)
router.delete('/remove/:id', checkShiftRoleMiddleware("manager"), loggerScansController.remove)
router.get('/:id', checkShiftMiddleware, loggerScansController.getById)
router.get('/', checkShiftMiddleware, loggerScansController.getAll)

module.exports = router
