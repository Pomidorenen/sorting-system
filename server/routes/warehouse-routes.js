const Router = require('express')
const router = new Router()

const warehouseController = require("../controllers/warehouse-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')
const authMiddleware = require('../middleware/auth-middleware')
router.post('/new', checkRoleMiddleware("manager"), warehouseController.addNew)
router.delete('/remove', checkRoleMiddleware("manager"), warehouseController.remove)
router.get('/:id', authMiddleware, warehouseController.findOne)
router.get('/', authMiddleware, warehouseController.findAll)

module.exports = router
