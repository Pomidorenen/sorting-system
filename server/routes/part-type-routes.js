const Router = require('express')
const router = new Router()

const partTypeController = require("../controllers/part-type-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')


router.post('/new', checkShiftRoleMiddleware("manager"), partTypeController.addNew)
router.delete('/remove', checkShiftRoleMiddleware("manager"), partTypeController.remove)
router.get('/:id', checkShiftMiddleware, partTypeController.findOne)
router.get('/', checkShiftMiddleware, partTypeController.findAll)

module.exports = router