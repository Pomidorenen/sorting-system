const ApiError = require('../error/api-error')
const {Address} = require('../database/models')
const logger = require('../modules/logger')
const e = require("express");

class AddressController
{
    async addNew(req, res, next)
    {
        try
        {
            logger.info("Call " + req.baseUrl + req.url)

            const {country, region, city, street, building, postal_code} = req.body
            if (!country || !region || !city || !street || !building || !postal_code)
            {
                logger.warn("Invalid address information: " + JSON.stringify(req.body))
                return next(ApiError.badRequest("Incorrect request data"))
            }

            logger.info("Add or find new address")
            const [address] = await Address.findOrCreate({
                where: {country, region, city, street, building, postal_code},
                defaults: {country, region, city, street, building, postal_code}
            })

            logger.done("Sending response")
            return res.json(address)
        }
        catch (e)
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
            logger.info("Get all address")
            const addresses = await Address.findAndCountAll()
            logger.done("Sending response")
            return res.json(addresses)
        }
        catch (e)
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

            logger.info("Get address")
            const address = await Address.findOne({where: {address_id: id}})
            if(address)
            {
                logger.done("Sending response")
                return res.json(address.dataValues)
            }
            else
            {
                logger.warn("Address not found")
                return next(ApiError.notFound('Address not found'))
            }
        }
        catch (e)
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

            logger.info("Removing address")
            await Address.destroy({where: {address_id: id.toString()}})

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

module.exports = new AddressController()