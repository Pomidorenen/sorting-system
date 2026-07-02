const { Shift } = require("../database/models");

class ShiftService{
    async isExsistedByEmployer(id){
        try{
            if(isNaN(id)){
                throw "Date is required";
            }
            
            const shift = await Shift.findAll({where: {
                employee_id:id
            }}) ?? null;

            return {
                exists: shift !== null,
                data:shift
            };

        }catch(error){
            return {error};
        }
    }
    async isExsistedByDate(date){
        try{

            if (!date) {
                throw 'Date is required';
            }

            const shift = await Shift.findOne({where: {
                start_datetime: { [Op.lte]: date }, 
                end_datetime: { [Op.gte]: date } 
            }}) ?? null;

            return {
                exists: shift !== null,
                data:shift
            }

        }catch(error){
            return {error};
        }
    }

}


module.exports = new ShiftService();