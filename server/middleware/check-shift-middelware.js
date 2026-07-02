const logger = require('../modules/logger');
const config = require('../modules/config');
const ApiError = require("../error/api-error.js");
const {isExsistedByDate} = require("../services/shift-services.js");

module.exports = async function (req, res, next) {
    try
    {
        const {exists,data:shift,error} = await isExsistedByDate( Date.now());
        if(!error){
            logger.error(error);
            return ApiError.notAuthorized(error);
        }
        if(!exists){
            logger.error("User not exists");
            return ApiError.notAuthorized(error);
        }
        logger.info("Shift is found");
        req.user = {id:shift.employee_id};
        next();
    } 
    catch(e)
    {
        res.status(401).json({message: "Not authorized"})
    }
};