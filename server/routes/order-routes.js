const Router = require('express')
const router = new Router()

const orderController = require("../controllers/order-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')

router.post('/new', checkShiftRoleMiddleware("manager"), orderController.addNew)
router.delete('/remove/:id', checkShiftRoleMiddleware("manager"), orderController.remove)
router.get('/:id', checkShiftMiddleware, orderController.findOne)
router.get('/', checkShiftMiddleware, orderController.findAll)
router.post('/item', checkShiftRoleMiddleware("manager"), orderController.addItem)
router.delete('/item/:id', checkShiftRoleMiddleware("manager"), orderController.deleteItem)

module.exports = router
