const Router = require('express')
const router = new Router()

const testingController = require("../controllers/testing-controller")

router.post("/init", testingController.init)

module.exports = router
