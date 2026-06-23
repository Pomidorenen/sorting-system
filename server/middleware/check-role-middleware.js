const jwt = require('jsonwebtoken')
const logger = require('../modules/logger')
const config = require("../modules/config");

module.exports = (role) =>
{
    return function (req, res, next)
    {
        if (req.method === "OPTIONS")
        {
            logger.warn("Auth was skipped due to the OPTIONS")
            next()
        }
        try
        {
            const token = req.headers.authorization.split(' ')[1]
            if (!token)
            {
                logger.error("Access token is missing")
                return res.status(401).json({message: "Not authorized"})
            }

            logger.info("Check access token")
            const decoded = jwt.verify(token, config.encryption.JWT_pass_code)
            logger.info("Access token is valid")

            if (decoded.role !== role)
            {
                logger.error("Incorrect role")
                return res.status(403).json({message: "Permission denied"})
            }
            logger.info("Role is correct")
            req.user = decoded;
            next()
        }
        catch (e)
        {
            logger.error("Unauthorized access token")
            res.status(401).json({message: "Not authorized"})
        }
    };
}



