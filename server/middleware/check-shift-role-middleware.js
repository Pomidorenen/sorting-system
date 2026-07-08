const logger = require('../modules/logger.js');
const config = require('../modules/config.js');
const ApiError = require("../error/api-error.js");
const {isExsistedByDate} = require("../services/shift-services.js");
const {Employee} = require("../database/models.js");
module.exports = (role) => async function (req, res, next) {
    try
    {
        var {exists, data:shift, error} = await isExsistedByDate(Date.now());
        if(error){
            logger.error(error);
            return res.status(401).json({message: "Not authorized"})
        }
        if(!exists){
            logger.error("User not exists");
             return res.status(401).json({message: "Not authorized"})
        }
        var user = await Employee.findByPk(shift.employee_id);
        if (user.role !== role)
        {
            logger.error("Incorrect role")
            return res.status(403).json({message: "Permission denied"})
        }
        logger.info("Shift is found");
        req.user = {id:shift.employee_id,role:user.role};
        next();
    } 
    catch(e)
    {
        res.status(401).json({message: "Not authorized"})
    }
};