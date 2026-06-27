const Router = require('express')
const router = new Router()

const loggerScansController = require("../controllers/logger-scan-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')
const authMiddleware = require('../middleware/auth-middleware')

router.post("/new",authMiddleware, loggerScansController.addNew)
router.delete('/clear', checkRoleMiddleware("manager"), loggerScansController.clear)
router.delete('/remove/:id', checkRoleMiddleware("manager"), loggerScansController.remove)
router.get('/:id', authMiddleware, loggerScansController.getById)
router.get('/', authMiddleware, loggerScansController.getAll)

module.exports = router
