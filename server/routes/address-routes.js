const Router = require('express')
const router = new Router()

const addressController = require("../controllers/address-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')

router.post('/new', checkShiftRoleMiddleware("manager"), addressController.addNew)
router.delete('/remove', checkShiftRoleMiddleware("manager"), addressController.remove)
router.get('/:id', checkShiftRoleMiddleware("manager"), addressController.findOne)
router.get('/', checkShiftRoleMiddleware("manager"), addressController.findAll)

module.exports = router
