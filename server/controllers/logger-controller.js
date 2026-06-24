const logger = require("../modules/logger");
const ApiError = require('../error/api-error');
const { Logging, ...Models } = require('../database/models')
const sequelize = require('../database/database');


class LoggerController {
    constructor(){
        //init hooks loggers for models
        Object.values(Models).forEach(function(model){
            for (const [method, hookName] of this) {
                model.addHook(hookName, (data, options) => {method(model.name, data, options)});
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
            logger.error(e);
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
            logger.error(e.message);
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
            logger.error(e.message);
        }
    }

    async getByModel(req, res, next){
        try {
            const {limit = 20, offset = 0} = req.query;
            const {model_name} = req.body;

            if(!model_name){
                logger.warn("Invalid log information: " + JSON.stringify(req.body));
                return next(ApiError.badRequest("Incorrect request data"))
            }

            const logs = await Logging.findAndCountAll({
                limit,
                offset,
                attributes:[
                   "logging_id",
                   "model_name",
                   "action",
                   "old_data",
                   "new_data",
                   "created_at" 
                ],
                where:{model_name}
            });

            if (logs) 
            {
                logger.done("Sending response");
                return res.json(log.dataValues);
            } else {
                logger.warn("Log not found")
                return next(ApiError.notFound('Log not found'))
            }
          
        } 
        catch (e) 
        {
            logger.error(e.message)
        }
    }
    async getById(req, res, next){
        try {
            const {id} = req.params;
            if (isNaN(id))
            {
                return next(ApiError.badRequest("Incorrect request data"));
            }
            logger.info("Find log");
            const log = await Logging.findOne({where: {logging_id: id}});
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
            const logs = await Logging.findAndCountAll({
                limit,
                offset,
                attributes:[
                   "logging_id",
                   "model_name",
                   "action",
                   "old_data",
                   "new_data",
                   "created_at" 
                ]
            });
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
            const lastLog = await Logging.findOne({
                order: [ ["created_at", 'DESC' ]]
            });
            if(lastLog){
                const model = sequelize.models[lastLog.model_name];
                if(!model){
                    logger.warn("Model not found");
                    return res.json({message:"Model not found"});
                }
                const primaryKeyName = model.primaryKeyAttributes[0];
                switch (lastLog.action)
                {
                    case "CREATE":{
                        await model.destroy({
                            where:{[primaryKeyName]:lastLog.new_data[primaryKeyName]}
                        },{ hooks: false });
                        break;
                    }
                    case "UPDATE":{
                        await model.update(
                            {...lastLog.old_data},
                            {where:{[primaryKeyName]:lastLog.new_data[primaryKeyName]}},
                            {hooks:false});
                        break;
                    }
                    case "DELETE":{
                        await model.create({...lastLog.old_data},{ hooks: false });
                        break;
                    }   
                }
                await Logging.destroy({where:{logging_id:lastLog.logging_id}});
                logger.done("Query undo");
                return res.json({message:"Query undo"});
            }else{
                logger.info("Log not found");
                return res.json({message:"Log not found"});
            }
        } 
        catch (e) 
        {
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }
    async clear(req, res, next){
        try {
            await Logging.destroy({ where: {} });
            return res.json({message:"Logs cleared"});
        } 
        catch (e) 
        {
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }
}



module.exports = new LoggerController();