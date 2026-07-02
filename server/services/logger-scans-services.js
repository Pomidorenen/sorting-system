const { LoggingScans, Employee, Part } = require('../database/models');

class LoggerScansService {
    async createScanLog(userId, partId, isRecovery = false) {
        try {
            const user = await Employee.findOne({where:{employee_id:userId}});
            const part = await Part.findOne({where:{part_id:partId}});
            
            if(!user){
                throw `Employee not found with id: ${userId}`;
            }
            if(!part){
                throw `Part not found with id: ${partId}`;
            }

            const typeScan= isRecovery ? 'RECOVERY' : 'CLEAR';
            const log = await LoggingScans.create({
                is_recovery: isRecovery,
                user_id: userId,
                part_id: partId,
                type_scan: typeScan
            });
            return {
                error: false,
                message: "Ok, Scan log create",
                log,
            };
        }
        catch(e){
            return {
                error: true,
                message: e,
                log: null
            };
        }
    }
    async getOneById(logId){
        try{
            const log = await LoggingScans.findOne({
                where: { logging_scans_id: logId },
                attributes: [
                    "logging_scans_id",
                    "is_recovery",
                    "type_scan",
                    "created_at"
                ],
                include: [{
                    model: Employee,
                    attributes: ['first_name', 'last_name', 'middle_name', 'role'],
                    as: "Employee"
                },{
                    model:  Part,
                    attributes :["serial_number","batch_number","manufacture_date"],
                    as: "Part"
                }]
            });
            if(!log){
                throw `Log not found with id: ${logId}`;
            }
            return {
                error:false,
                message:"Log found",
                log,
            };
        }catch(e){
            return {
                error: true,
                message: e,
                log: null
            };
        }
    }
}

module.exports = new LoggerScansService();