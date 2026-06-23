const Router = require('express')
const router = new Router()

const partController = require("../controllers/part-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')
const authMiddleware = require('../middleware/auth-middleware')

router.post('/new', checkRoleMiddleware("manager"), partController.addNew)
router.delete('/remove', checkRoleMiddleware("manager"), partController.remove)
router.put('/:part_id/change-order', authMiddleware, partController.changeOrder)
router.put('/:part_id/sort', authMiddleware, partController.sortPart)
router.get('/:part_id/orders', authMiddleware, partController.findOrders)
router.get('/:id', authMiddleware, partController.findOne)
router.get('/', authMiddleware, partController.findAll)

module.exports = router