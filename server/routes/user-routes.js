const Router = require('express')
const router = new Router()

const userController = require("../controllers/user-controller")
const authMiddleware = require('../middleware/auth-middleware')
const checkRoleMiddleware = require('../middleware/check-role-middleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.get('/me', authMiddleware, userController.aboutMe)
router.get('/', checkRoleMiddleware("manager"), userController.getAll)
router.get('/:id', checkRoleMiddleware("manager"), userController.getOne)

module.exports = router
