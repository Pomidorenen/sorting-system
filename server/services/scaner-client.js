const {WebSocketServer} = require('ws');
const scanController = require('../controllers/scan-controller');
const {Employee} = require("../database/models");
const logger = require('../modules/logger');
const {isExsistedByDate} = require("./shift-services");

const CreateScannerClient = (port = 8080) =>{
    const wss = new WebSocketServer({port});
    wss.on("connection", function connection(ws){
        ws.on("message",async function message(data){
            try {
                    const msg = JSON.parse(data);
                    const {exists,data:shift,error} = await isExsistedByDate(Date.now());
                    if(error){
                        logger.error(error);
                        return;
                    }
                    if(!exists){
                        logger.error("User not exists");
                        return;
                    }
                    const user = await Employee.findByPk(shift.employee_id);
                    logger.info("Shift is found");

                    const req = {
                        body: {
                            camera_id:msg.camera_id,
                            serial_number: msg.code,
                            is_recovery: msg.restored,
                        },
                        files: {
                            image: {
                                name: '',
                                data: Buffer.alloc(0),
                                mimetype: '',
                                size: 0
                            }
                            },
                        user: {id:shift.employee_id, role: user.role}
                        ,
                            baseUrl: '',
                            url: ''
                        };

                        const res = {
                            json: (obj) => logger.info(obj)
                        };

                        const next = (err) => {
                            if (err)
                                logger.error(err.message);
                        };

                        await scanController.scanCode(req, res, next);
                    } 
                    catch (e) {
                        logger.error(e);
                    }
            });
            ws.on('close', () => {
                logger.warn('Scanner disconnected. Reconnecting...');
            });
            ws.on('open', () => {
                logger.info(`Connected to scanne`);
            });
            ws.on('error', (err) => {
                    logger.error(err.message);
            });
    }) 
    return wss;
}
   

module.exports = CreateScannerClient;