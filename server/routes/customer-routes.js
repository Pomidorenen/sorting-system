const Router = require('express')
const router = new Router()

const customerController = require("../controllers/customer-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')

router.post('/new', checkShiftRoleMiddleware("manager"), customerController.addNew)
router.delete('/remove', checkShiftRoleMiddleware("manager"), customerController.remove)
router.get('/:id', checkShiftRoleMiddleware("manager"), customerController.findOne)
router.get('/', checkShiftRoleMiddleware("manager"), customerController.findAll)

module.exports = router