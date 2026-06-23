const ApiError = require('../error/api-error')
const {Customer, Address} = require('../database/models')
const logger = require('../modules/logger')

class CustomerController
{
    async addNew(req, res, next)
    {
        try
        {
            logger.info("Call " + req.baseUrl + req.url)
            const {company_name, inn, ogrn, address_id} = req.body
            if (!company_name || !inn || !ogrn || !address_id)
            {
                logger.warn("Invalid сustomer information: " + JSON.stringify(req.body))
                return next(ApiError.badRequest("Incorrect request data"))
            }

            logger.info("Add or find new customer")
            const [customer] = await Customer.findOrCreate({
                where: { company_name, inn, ogrn, address_id },
                defaults: { company_name, inn, ogrn, address_id },
                include: [{ model: Address, as: 'address' }]
            })

            logger.done("Sending response")
            return res.json(customer)
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

            logger.info("Finding customers")
            const customers = await Customer.findAndCountAll({include: [{ model: Address, as: 'address' }]})

            logger.done("Sending response")
            return res.json(customers)
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
            const customer = await Customer.findOne({where: {customer_id: id}, include: [{ model: Address, as: 'address' }]})
            if(customer)
            {
                logger.done("Sending response")
                return res.json(customer.dataValues)
            }
            else
            {
                return next(ApiError.notFound('Customer not found'))
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

            logger.info("Removing customer")
            await Customer.destroy({where: {customer_id: id.toString()}})

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

module.exports = new CustomerController()