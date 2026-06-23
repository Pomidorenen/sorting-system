const Router = require('express')

const userRouter = require('./user-routes')
const addressRouter = require('./address-routes')
const warehouseRouter = require('./warehouse-routes')
const customerRouter = require('./customer-routes')
const orderRouter = require('./order-routes')
const partTypeRouter = require('./part-type-routes')
const partRouter = require('./part-routes')
const scanRouter = require('./scan-routes')
const testingRouter = require('./testing-routes')


const router = new Router()
router.use("/user", userRouter)
router.use("/address", addressRouter)
router.use("/warehouse", warehouseRouter)
router.use("/customer", customerRouter)
router.use("/order", orderRouter)
router.use("/part-type", partTypeRouter)
router.use("/part", partRouter)
router.use("/service", scanRouter)
router.use("/test", testingRouter)


module.exports = router
