const logger = require('../modules/logger.js');
const config = require('../modules/config.js');
const ApiError = require("../error/api-error.js");
const {isExsistedByDate} = require("../services/shift-services.js");
const {Employee} = require("../database/models.js");
module.exports = async function (req, res, next) {
    try
    {
        const {exists,data:shift,error} = await isExsistedByDate(Date.now());
        if(error){
            logger.error(error);
            return res.status(401).json({message: "Not authorized"})
        }
        if(!exists){
            logger.error("User not exists");
            return res.status(401).json({message: "Not authorized"})
        }
        const user = await Employee.findByPk(shift.employee_id);
        logger.info("Shift is found");
        req.user = {id:shift.employee_id, role: user.role};
        next();
    } 
    catch(e)
    {
        res.status(401).json({message: "Not authorized"})
    }
};