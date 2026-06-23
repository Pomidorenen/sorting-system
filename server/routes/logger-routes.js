const Router = require('express')
const router = new Router()

const loggerController = require("../controllers/logger-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')
const authMiddleware = require('../middleware/auth-middleware')


router.delete('/clear', checkRoleMiddleware("manager"), loggerController.clear)
router.delete('/remove/:id', checkRoleMiddleware("manager"), loggerController.remove)
router.get('/:id', checkRoleMiddleware("manager"), loggerController.getById)
router.get('/', checkRoleMiddleware("manager"), loggerController.getAll)
router.get('/model', checkRoleMiddleware("manager"), loggerController.getByModel)
router.patch("/undo",checkRoleMiddleware("manager"), loggerController.undo)

module.exports = router
