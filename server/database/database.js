const {Sequelize} = require('sequelize')
const config = require('../modules/config')

module.exports = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        dialect: 'postgres',
        host: config.database.host,
        port: config.database.port,
        logging:false
    }
)
