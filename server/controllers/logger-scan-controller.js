const logger = require("../modules/logger");
const ApiError = require('../error/api-error');
const { LoggingScans, Employee, Part } = require('../database/models')
const loggerScansService = require("../services/logger-scans-services");
const sequelize = require('../database/database');


class LoggerScansController {
    async addNew(req, res, next){
        try{
            logger.info("Call " + req.baseUrl + req.url);
            const { is_recovery, part_id } = req.body;
            if(!is_recovery || !part_id){
                logger.warn("Data is requred");
                return next(ApiError.conflict("Data is requred"));
            }
            if (!req.user) {
                logger.warn("Unauthorized access attempt");
                return next(ApiError.unauthorized('User not authenticated'));
            }

            const userId = req.user.id;

            const {
                log: newLog, ...err
            } = await loggerScansService.createScanLog(userId, part_id, is_recovery);

            if(err.error){
                logger.error(err.message);
                return next(ApiError.internal(err.message));
            }

            logger.done(`Log entry created with id: ${newLog.logging_scans_id}`);

            logger.done("Sending response");
            return res.json(newLog);
        }
        catch(e)
        {
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }    
    async getById(req, res, next){
        try {
            const {id} = req.params;

            if (isNaN(id))
            {
                return next(ApiError.badRequest("Incorrect request data"));
            }

            const {
                log,
                ...err
            } = await loggerScansService.getOneById(id);

            if(err.error){
                logger.warn("Log not found");
                return next(ApiError.notFound(err.message));
            }

            logger.done("Sending response");
            return res.json(log.dataValues);
        } 
        catch (e) 
        {
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
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
                   "type_scan",
                   "created_at",
                    "part_id",
                    "user_id" 
                ],
                include: [{
                model: Employee, 
                attributes: ['first_name', 'last_name', 'middle_name',], 
                as:"employee"
                },{
                    model:  Part,
                    attributes :["serial_number","batch_number","manufacture_date"],
                    as: "part"
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
            await LoggingScans.destroy({where: {logging_scans_id: id}});

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