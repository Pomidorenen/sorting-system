const Router = require('express')
const router = new Router()

const addressController = require("../controllers/address-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')

router.post('/new', checkRoleMiddleware("manager"), addressController.addNew)
router.delete('/remove', checkRoleMiddleware("manager"), addressController.remove)
router.get('/:id', checkRoleMiddleware("manager"), addressController.findOne)
router.get('/', checkRoleMiddleware("manager"), addressController.findAll)

module.exports = router
