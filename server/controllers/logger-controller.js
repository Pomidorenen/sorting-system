const logger = require("../modules/logger");
const ApiError = require('../error/api-error');
const { Logging, ...Models } = require('../database/models')
const { Sequelize, where } = require('sequelize');
const { Logger } = require('sequelize/lib/utils/logger');


class LoggerController {
    constructor(){
        //init hooks loggers for models
        Object.values(Models).forEach(function(model){
            for (const [method, hookName] of this) {
                model.addHook(hookName, (data, options) =>{method(model.tableName, data, options)});
            }
        },[
            [this.addNewCreate, "afterCreate"],
            [this.addNewDestroy, "afterDestroy"],
            [this.addNewUpdate, "afterUpdate"]
        ]);
    }
    async addNewCreate(modelName, data, options){
        try {
            logger.info("Creating new log:" + modelName + "-" + "create")
            await Logging.create({
                model_name: modelName,
                action: 'CREATE',
                new_data: data.toJSON(),
            });
        } 
        catch (e) 
        {
            logger.error(e)
            ApiError.internal('Request error: ' + e.message)
        }
    }
    async addNewUpdate(modelName, data, options){
        try {
            const oldData = { ...data._previousDataValues };
            logger.info("Creating new log:" + modelName + "-" + "update");
            await Logging.create({
                model_name: modelName,
                action: 'UPDATE',
                old_data: oldData,
                new_data: data.toJSON(),
            });
        } 
        catch (e) 
        {
            logger.error(e)
            ApiError.internal('Request error: ' + e.message)
        }
    }
    async addNewDestroy(modelName, data, options){
        try {
            logger.info("Creating new log:" + modelName + "-" + "destroy");
            await Logging.create({
                model_name: modelName,
                action: 'DELETE',
                old_data: data.toJSON(),
            });
        } 
        catch (e) 
        {
            logger.error(e)
            ApiError.internal('Request error: ' + e.message)
        }
    }

    async getByModel(req, res, next){
        try {
            const {limit = 20, offset = 0} = req.query
            const {model_name} = req.body
            const logs = await Logger.findAndCountAll({
                limit,
                offset,
                attributes:[
                   "logging_id",
                   "model_name",
                   "action",
                   "old_data",
                   "new_data",
                   "user_id",
                   "created_at" 
                ],
                where:{model_name}
            });

            if (logs) 
            {
                 logger.done("Sending response")
                return res.json(log.dataValues)
            } else {
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
    async getById(req, res, next){
        try {
            const {id} = req.params;

            logger.info("Find log");
            const log = await Logger.findOne({where: {logging_id: id}})

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
            const logs = await Logger.findAndCountAll({
                limit,
                offset,
                attributes:[
                   "logging_id",
                   "model_name",
                   "action",
                   "old_data",
                   "new_data",
                   "user_id",
                   "created_at" 
                ]
            });
            return res.json(logs);
        } 
        catch (e) 
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async remove(req, res, next){
        try {
            logger.info("Call " + req.baseUrl + req.url)
            const {id} = req.body

            logger.info("Removing log")
            await Logger.destroy({where: {logging_id: id}})

            logger.done("Sending response")
            return res.json({message:"Log remove"});
        } 
        catch (e) 
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async undo(req, res, next){
        try {
            
        } 
        catch (e) 
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
    async clear(req, res, next){
        try {
            await Logging.destroyAll();

            return res.json({message:"Logs cleared"})
        } 
        catch (e) 
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}



module.exports = new LoggerController();