const Router = require('express');
const router = new Router();

const shiftController = require("../controllers/shift-controller");

router.post("/new", shiftController.addNew);
router.delete('/remove', shiftController.remove );
router.put('/change', shiftController.changeShift );
router.get("/", shiftController.findAll );
router.get("/:id", shiftController.getOneById );
router.get("/employee/:id", shiftController.getByEmployee );

module.exports = router;