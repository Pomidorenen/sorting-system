const Router = require('express')
const router = new Router()

const warehouseController = require("../controllers/warehouse-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')

router.post('/new', checkShiftRoleMiddleware("manager"), warehouseController.addNew)
router.delete('/remove', checkShiftRoleMiddleware("manager"), warehouseController.remove)
router.get('/:id', checkShiftMiddleware, warehouseController.findOne)
router.get('/', checkShiftMiddleware, warehouseController.findAll)

module.exports = router
