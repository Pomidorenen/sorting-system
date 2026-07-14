const WebSocket = require('ws');
const config = require('../modules/config');
const scanController = require('../controllers/scan-controller');
const {Employee} = require("../database/models");
const logger = require('../modules/logger');
const {isExsistedByDate} = require("./shift-services");

const CreateCameraClient = () =>{
    let ws;

    const connect = () =>{
        logger.info(`Connecting to camera ${config.websocket.url}`);
        ws = new WebSocket(config.websocket.url);

        ws.on('open', () => {
            logger.done("Connected to camera");
        });

        ws.on("message",async function message(data){
            try {
                    const msg = JSON.parse(data);
                    const {exists,data:shift,error} = await isExsistedByDate(Date.now());
                    if(error){
                        logger.error(error);
                        return;
                    }
                    if(!exists){
                        logger.error("Shift not exists");
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
            logger.warn(`Camera disconnected. Reconnecting in ${config.websocket.reconnect_interval}ms...`);
            setTimeout(connect, config.websocket.reconnect_interval);
        });

        ws.on('error', (err) => {
                logger.error(err.message);
        });
    }

    connect();
    return ws;
}


module.exports = CreateCameraClient;
