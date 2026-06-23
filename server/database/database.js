const {Sequelize} = require('sequelize')
const config = require('../modules/config')
const loggerSql = require('../modules/logger-sql')

module.exports = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        dialect: 'postgres',
        host: config.database.host,
        port: config.database.port,
        logging: loggerSql.logging
    }
)
