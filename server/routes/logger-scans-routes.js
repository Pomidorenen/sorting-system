const Router = require('express')
const router = new Router()

const loggerScansController = require("../controllers/logger-scan-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')

router.delete('/clear', checkRoleMiddleware("manager"), loggerScansController.clear)
router.delete('/remove/:id', checkRoleMiddleware("manager"), loggerScansController.remove)
router.get('/:id', checkRoleMiddleware("manager"), loggerScansController.getById)
router.get('/', checkRoleMiddleware("manager"), loggerScansController.getAll)

module.exports = router
