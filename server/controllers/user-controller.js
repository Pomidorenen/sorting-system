const ApiError = require('../error/api-error')
const {Employee} = require('../database/models')
const config = require('../modules/config')
const logger = require('../modules/logger')


class UserController
{
    async registration(req, res, next)
    {
        try
        {
            const { first_name, last_name, middle_name, role, } = req.body
            if (!first_name || !last_name || !middle_name || !role )
            {
                return next(ApiError.badRequest("Incorrect request data"))
            }

            user = await Employee.create({
                first_name: first_name,
                last_name: last_name,
                middle_name: middle_name,
                role: role,
            });

            logger.done("User is create");
            return res.status(200).json({message:"User is create"});
        }
        catch (e)
        {
            return next(ApiError.internal('Registration error: ' + e.message))
        }
    }


    async getAll(req, res, next)
    {
        try
        {
            const {limit = 20, offset = 0} = req.query
            const users = await Employee.findAndCountAll({limit, offset, attributes: [
                    "employee_id",
                    "first_name",
                    "last_name",
                    "middle_name",
                    "role",
                    "is_active",
                    "created_at",
                ]})
            return res.json(users)
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async aboutMe(req, res, next)
    {
        try
        {
            const user = await Employee.findOne({where: {employee_id: req.user.id}, attributes: [
                    "employee_id",
                    "first_name",
                    "last_name",
                    "middle_name",
                    "role",
                    "is_active",
                    "created_at"
                ]})
            return res.json(user)
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }

    async getOne(req, res, next)
    {
        try
        {
            const {id} = req.params
            if (isNaN(id))
            {
                return next(ApiError.badRequest("Incorrect request data"))
            }
            const user = await Employee.findOne({where: {employee_id: id}, attributes: [
                    "employee_id",
                    "first_name",
                    "last_name",
                    "middle_name",
                    "role",
                    "is_active",
                    "created_at"
                ]})

            if (user)
            {
                return res.json(user)
            }
            else
            {
                return next(ApiError.notFound('Employee not found'))
            }
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}

module.exports = new UserController()
