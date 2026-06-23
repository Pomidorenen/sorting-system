const ApiError = require('../error/api-error')
const logger = require('../modules/logger')
const {PartType, Address} = require('../database/models')
const utils = require("../modules/utils");


class PartTypeController
{
    async addNew(req, res, next)
    {
        try
        {
            logger.info("Call " + req.baseUrl + req.url)
            const {name, price} = req.body
            if(!name || !price)
            {
                logger.warn("Invalid part-type information: " + JSON.stringify(req.body))
                return next(ApiError.badRequest("Incorrect request data"))
            }

            logger.info("Adding new part-type")
            const type_code = utils.TransliterateText(name).toUpperCase().replace(" ", "")
            const [partType] = await PartType.findOrCreate({
                where: {name, type_code, price},
                defaults: {name, type_code, price}
            })

            logger.done("Sending response")
            return res.json(partType)
        }
        catch(e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async findAll(req, res, next)
    {
        try
        {
            logger.info("Call " + req.baseUrl + req.url)

            logger.info("Find part-types")
            const partTypes = await PartType.findAndCountAll()

            logger.done("Sending response")
            return res.json(partTypes)
        }
        catch(e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async findOne(req, res, next)
    {
        try
        {
            logger.info("Call " + req.baseUrl + req.url)
            const {id} = req.params

            logger.info("Find part-type")
            const partType = await PartType.findOne({where: {part_type_id: id}})
            if(partType)
            {
                logger.done("Sending response")
                return res.json(partType.dataValues)
            }
            else
            {
                logger.warn("Part-type not found")
                return next(ApiError.notFound('PartType not found'))
            }

        }
        catch(e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async remove(req, res, next)
    {
        try
        {
            logger.info("Call " + req.baseUrl + req.url)

            const {id} = req.body
            if(isNaN(id))
            {
                logger.warn("Invalid part-type information: " + JSON.stringify(req.body))
                return next(ApiError.badRequest("Incorrect request data"))
            }

            logger.info("Remove part-type")
            await PartType.destroy({where: {part_type_id: id.toString()}})

            logger.done("Sending response")
            return res.json({status: 200, message: 'Ok'})
        }
        catch(e)
        {
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}

module.exports = new PartTypeController()
