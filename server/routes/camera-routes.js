const Router = require('express')
const router = new Router()

const CamerasController = require("../controllers/camera-controller")
const checkShiftRoleMiddleware = require('../middleware/check-shift-role-middleware')
const checkShiftMiddleware = require('../middleware/check-shift-middleware')

router.post("/new",checkShiftMiddleware, CamerasController.addNew)
router.delete('/remove', checkShiftRoleMiddleware("manager"), CamerasController.remove)
router.get('/:id', checkShiftMiddleware, CamerasController.getById)
router.get('/', checkShiftMiddleware, CamerasController.getAll)

module.exports = router;
