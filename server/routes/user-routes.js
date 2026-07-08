const Router = require('express')
const router = new Router()

const userController = require("../controllers/user-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')

router.post('/registration', userController.registration)
router.get('/me', checkShiftMiddleware, userController.aboutMe)
router.get('/', checkShiftRoleMiddleware("manager"), userController.getAll)
router.get('/:id', checkShiftRoleMiddleware("manager"), userController.getOne)

module.exports = router
