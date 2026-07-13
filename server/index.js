const logger = require('./modules/logger')

logger.info("Load environment")
const config = require('./modules/config')

logger.info("Load libraries")
const express = require('express')
const cors = require('cors')
const http = require('http')
const fileUpload = require('express-fileupload')

logger.info("Load modules")
const database = require('./database/database')
const router = require('./routes/router')
const socket = require('./controllers/service-controller')
const errorHandler = require('./middleware/error-handling-middleware')

// Server settings
const PORT = config.app.port || 5000

const CreateScannerClient = require('./services/scaner-client');

logger.info("Start ws scanner");
const WS_PORT = 8080;
CreateScannerClient(WS_PORT);

logger.info("Creating app")
const app = express()
app.use(cors())
app.use(express.json())
app.use(fileUpload({}))
app.use('/api', router)
app.use(errorHandler)

logger.info("Creating server")
const server = http.createServer(app)
server.on("upgrade", socket.authenticate.bind(socket))

const start = async () => {
    try
    {
        logger.info("Connecting database")
        await database.authenticate()
        logger.info("Sync database")
        await database.sync()
        server.listen(PORT, () => {
            logger.done(`REST API server started on port ${PORT}`)
            logger.done(`WebSocket server started on port ${PORT}`)
        })

    }
    catch (e)
    {
        logger.error(e)
    }
}

logger.info("Starting server")
start()
