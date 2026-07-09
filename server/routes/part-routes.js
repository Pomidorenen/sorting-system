const Router = require('express')
const router = new Router()

const partController = require("../controllers/part-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')

router.post('/new', checkShiftRoleMiddleware("manager"), partController.addNew)
router.delete('/remove1', checkShiftRoleMiddleware("manager"), partController.remove)
router.put('/:part_id/change-order', checkShiftMiddleware, partController.changeOrder)
router.put('/:part_id/sort', checkShiftMiddleware, partController.sortPart)
router.get('/:part_id/orders', checkShiftMiddleware, partController.findOrders)
router.get('/:id', checkShiftMiddleware, partController.findOne)
router.get('/', checkShiftMiddleware, partController.findAll)

module.exports = router