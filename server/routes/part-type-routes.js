const Router = require('express')
const router = new Router()

const partTypeController = require("../controllers/part-type-controller")
const checkRoleMiddleware = require('../middleware/check-role-middleware')
const authMiddleware = require('../middleware/auth-middleware')

router.post('/new', checkRoleMiddleware("manager"), partTypeController.addNew)
router.delete('/remove', checkRoleMiddleware("manager"), partTypeController.remove)
router.get('/:id', authMiddleware, partTypeController.findOne)
router.get('/', authMiddleware, partTypeController.findAll)

module.exports = router