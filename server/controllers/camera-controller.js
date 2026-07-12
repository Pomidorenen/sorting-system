const logger = require("../modules/logger");
const ApiError = require('../error/api-error');
const {Camera } = require('../database/models')
const loggerScansService = require("../services/logger-scans-services");
const sequelize = require('../database/database');


class CameraController{

    async addNew(req, res, next){
        try{
            const { name, resolution_height, resolution_width, frame_rate } = req.body;
            if (!name || !resolution_height || !resolution_width || !frame_rate )
            {
                return next(ApiError.badRequest("Incorrect request data"));
            }

            const camera = await Camera.create({
                name,
                resolution_height,
                resolution_height,
                frame_rate,
                is_actice:true
            });

            logger.done("Camera is create");
            return res.status(200).json({message:"Camera is create"});
       
        }catch(e){
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async getById(req, res, next){
        try{
            logger.info("Call " + req.baseUrl + req.url);
            const {id} = req.params;
            const camera = await Camera.findOne({where: {camera_id: id}})
            if(!camera)
            {
                return next(ApiError.notFound('Camera not found'));
            }
            logger.done("Sending response");
            return res.json(camera.dataValues);       
        }
        catch (e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
     
    }

    async getAll(req, res, next){
        try
        {
            logger.info("Call " + req.baseUrl + req.url)
            logger.info("Finding cameras")
            const cameras = await Camera.findAndCountAll();

            logger.done("Sending response")
            return res.json(cameras)
        }
        catch (e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async remove(req, res, next){
        try
        {
            logger.info("Call " + req.baseUrl + req.url);
            const {id} = req.body;

            logger.info("Removing camera")
            await Camera.destroy({where: {camera_id: id.toString()}})

            logger.done("Sending response")
            return res.json({message: 'Ok'})
        }
        catch (e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}



module.exports = new CameraController();