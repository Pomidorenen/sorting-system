const logger = require('./logger');

const time = 1000;

class LoggerSql {
    logging(sql, timing){
        if(timing > time){
            logger.warn(`Slow query: ${timing}-ms`);
        }
    }
}

module.exports = new LoggerSql(); 