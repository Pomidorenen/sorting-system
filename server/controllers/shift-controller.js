const logger = require("../modules/logger");
const ApiError = require('../error/api-error');
const { Shift, Employee } = require('../database/models')
const sequelize = require('../database/database');
const { Op } = require('sequelize');
const {isExsistedByEmployer} = require("../services/shift-services");

class ShiftController{
    async addNew(req, res, next){
        try{
            const {id, start_datetime, end_datetime} = req.body;
            const employee = await Employee.findOne({where:{employee_id:id}});
            if(!employee){
                logger.error("User not found");
                return next(ApiError.notFound('Part not found'));
            }
            const startDate = new Date(start_datetime);
            const endDate = new Date(end_datetime);

            if(isNaN(startDate.getTime() || endDate.getTime())){
                 return next(ApiError.badRequest('Is not correct data'));
            }

            if(startDate>=endDate){
                 return next(ApiError.badRequest('The start time must be before the end time'));
            }

            const overlappingShift = await Shift.findOne({
                where: {
                    employee_id: id,
                    [Op.or]: [
                        {
                            start_datetime: { [Op.lte]: startDate },
                            end_datetime: { [Op.gte]: startDate }
                        },
                        {
                            start_datetime: { [Op.lte]: endDate },
                            end_datetime: { [Op.gte]: endDate }
                        },
                        {
                            start_datetime: { [Op.gte]: startDate },
                            end_datetime: { [Op.lte]: endDate }
                        }
                    ]
                }
            });

            if (overlappingShift) {
                logger.warn(`Shift overlap for employee ${id} at ${startDate}`);
                return next(ApiError.conflict('The new shift overlaps with the existing one'));
            }

            const newShift = await Shift.create({
                employee_id: id,
                start_datetime: startDate,
                end_datetime: endDate
            });

            logger.done("Sending response")
            return res.json(newShift);

        }catch(e){
            logger.error(e);
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }
    async findAll(req, res, next){
        try
        {
            let {limit = 20, offset = 0} = req.query;
            logger.info("Getting all shift")
            const shfits = await Shift.findAndCountAll({
                limit, 
                offset,
                include: [{ model: Employee, as: 'employee', attributes:["first_name","last_name","middle_name"] }]})
            return res.json(shfits);
        }
        catch (e)
        {
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }
    async getOneById(req, res, next){
        try{
            const {id} = req.params;
            if(isNaN(id)){
                logger.warn(`Invalid shift id: ${id}`);
                return next(ApiError.badRequest('Invalid shift identifier'));
            }
            const shift = await Shift.findOne({
                where: { shift_id: id },
                include: [{
                    model: Employee,
                    as: 'employee',
                    attributes:["first_name","last_name","middle_name"] 
                }]
            });

            if (!shift) {
                logger.info(`Shift with id ${id} not found`);
                return next(ApiError.notFound('Shift is not fouind'));
            }
            
            logger.info("Getting shift");
            return res.json(shift);

        }catch(e){
             return next(ApiError.internal('Request error: ' + e.message));
        }
    }
    async getByEmployee(req, res, next){
        try{
            const {id} = req.params;
            if(isNaN(id)){
                logger.warn(`Invalid shift id: ${id}`);
                return next(ApiError.badRequest('Invalid shift identifier'));
            }
            const {exists,data:shifts,error} = await isExsistedByEmployer(id);
            if(error){
                logger.error(error);
                return next(ApiError.notFound('Shift is not found'));
            }

            if (!exists) {
                logger.info(`Shift with id ${id} not found`);
                return next(ApiError.notFound('Shift is not found'));
            }

            logger.info("Getting shift");
            return res.json(shifts);
        }catch(e){
            return next(ApiError.internal('Request error: ' + e.message));
        }
    }
    async remove(req, res, next){
        try{
            const { id } = req.body;
            if (isNaN(id) ) {
                logger.warn(`Invalid shift id: ${id}`);
                return next(ApiError.badRequest('Invalid shift identifier'));
            }
            const shift = await Shift.findByPk(id);
            if (!shift) {
                logger.info(`Shift with id ${id} not found`);
                return next(ApiError.notFound('Shift not found'));
            }
            await shift.destroy();
          
            logger.done("Sending response")
            return res.json({status: 200, message: 'Ok'})
        }catch(e){
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
    async changeShift(req, res, next){
        try{
            const {id, start_datetime, end_datetime} = req.body;
             if (!id || !start_datetime || !end_datetime) {
                logger.warn('Missing fields for shift update');
                return next(ApiError.badRequest('Required id, start_datetime and end_datetime'));
            }
            if(isNaN(id)){
                logger.warn(`Invalid shift id for update: ${id}`);
                return next(ApiError.badRequest('Invalid shift identifier'));
            }
         
            const startDate = new Date(start_datetime);
            const endDate = new Date(end_datetime);

            if(isNaN(startDate.getTime() || endDate.getTime())){
                 return next(ApiError.badRequest('Is not correct data'));
            }

            if(startDate>=endDate){
                 return next(ApiError.badRequest('The start time must be before the end time'));
            }
            const shift = await Shift.findByPk(id);
            if (!shift) {
                logger.info(`Shift with id ${id} not found for update`);
                return next(ApiError.notFound('Shift not found'));
            }
            const overlappingShift = await Shift.findOne({
                where: {
                    shift_id: { [Op.ne]: id }, 
                    [Op.or]: [
                        {
                            start_datetime: { [Op.lt]: endDate },
                            end_datetime: { [Op.gt]: startDate }
                        }
                    ]
                }
            });
            
            if (overlappingShift) {
                logger.warn(`Shift overlap for employee ${shift.employee_id} when updating shift ${shiftId}`);
                return next(ApiError.conflict("The new date overlaps with another employee's shift"));
            }
            await shift.update({
                start_datetime: startDate,
                end_datetime: endDate
            });
          
            logger.done("Sending response")
            return res.json({status: 200, message: 'Ok'})
        }catch(e){
            logger.error(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}


module.exports = new ShiftController();