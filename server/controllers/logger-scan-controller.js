const logger = require("../modules/logger");
const ApiError = require('../error/api-error');
const { LoggingScans,Employee } = require('../database/models')
const sequelize = require('../database/database');


class LoggerScansController {
    async addNew(){

    }    
    async getById(req, res, next){
        try {
            const {id} = req.params;
            if (isNaN(id))
            {
                return next(ApiError.badRequest("Incorrect request data"));
            }
            logger.info("Find log");
            const log = await LoggingScans.findOne({where: {logging_scans_id: id}},{
                attributes:[
                   "logging_scans_id",
                   "is_recovery",
                   "user_id",
                   "type_scan",
                   "created_at" 
                ],
                include: [{
                model: Employee, 
                // Мб еще поля добавить по необходимости,к примеру  Rolе
                attributes: ['first_name', 'last_name', 'middle_name',], 
                as:"Employee"
            }]
            });
            if (log)
            {
                logger.done("Sending response")
                return res.json(log.dataValues)
            }
            else
            {
                logger.warn("Log not found")
                return next(ApiError.notFound('Log not found'))
            }
        } 
        catch (e) 
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async getAll(req, res, next){
        try {
            const {limit = 20, offset = 0} = req.query;
            const logs = await LoggingScans.findAndCountAll({
                limit,
                offset,
                attributes:[
                   "logging_scans_id",
                   "is_recovery",
                   "user_id",
                   "type_scan",
                   "created_at" 
                ],
                include: [{
                model: Employee, 
                // Мб еще поля добавить по необходимости,к примеру  Rolе
                attributes: ['first_name', 'last_name', 'middle_name',], 
                as:"Employee"
                }]
            });
            logger.done("Sending response")
            return res.json(logs);
        } 
        catch (e) 
        {
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }

    async remove(req, res, next){
        try {
            logger.info("Call " + req.baseUrl + req.url);
            const {id} = req.body;
            if (isNaN(id))
            {
                return next(ApiError.badRequest("Incorrect request data"))
            }

            logger.info("Removing log");
            await Logger.destroy({where: {logging_id: id}});

            logger.done("Sending response")
            return res.json({message:"Log remove"});
        } 
        catch (e) 
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async clear(req, res, next){
        try {
            await LoggingScans.destroy({ where: {} });
            return res.json({message:"Logs cleared"});
        } 
        catch (e) 
        {
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }
}



module.exports = new LoggerScansController();


