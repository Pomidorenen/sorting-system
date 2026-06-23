const ApiError = require('../error/api-error')
const {Warehouse, Address} = require('../database/models')

class WarehouseController
{
    async addNew(req, res, next)
    {
        try
        {
            const {name, address_id} = req.body
            if (!name || !address_id)
            {
                return next(ApiError.badRequest("Incorrect request data"))
            }

            const [warehouse] = await Warehouse.findOrCreate({
                where: { name, address_id },
                defaults: { name, address_id },
                include: [{ model: Address, as: 'address' }]
            })

            return res.json(warehouse)
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async findAll(req, res, next)
    {
        try
        {
            const warehouses = await Warehouse.findAndCountAll({include: [{ model: Address, as: 'address' }]})
            return res.json(warehouses)
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async findOne(req, res, next)
    {
        try
        {
            const {id} = req.params
            const warehouse = await Warehouse.findOne({where: {warehouse_id: id}, include: [{ model: Address, as: 'address' }]})
            if(warehouse)
            {
                return res.json(warehouse.dataValues)
            }
            else
            {
                return next(ApiError.notFound('Warehouse not found'))
            }
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async remove(req, res, next)
    {
        try
        {
            const {id} = req.body
            await Warehouse.destroy({where: {warehouse_id: id.toString()}})
            return res.json({message: 'Ok'})
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}

module.exports = new WarehouseController()