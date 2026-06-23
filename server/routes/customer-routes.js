const Router = require('express')
const router = new Router()

const customerController = require("../controllers/customer-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')

router.post('/new', checkRoleMiddleware("manager"), customerController.addNew)
router.delete('/remove', checkRoleMiddleware("manager"), customerController.remove)
router.get('/:id', checkRoleMiddleware("manager"), customerController.findOne)
router.get('/', checkRoleMiddleware("manager"), customerController.findAll)

module.exports = router