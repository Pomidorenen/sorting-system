const fs = require('fs')
const path = require('path')
const logger = require('./logger')
const {faker} = require('@faker-js/faker')

class Config
{
    constructor()
    {
        this.def = {
            database: {
                host: "localhost",
                port: 5432,
                name: "sort",
                user: "postgres",
                password: "postgres",
            },
            app: {
                port: 5000,
                dev_mode: false
            },
            encryption: {
                salt: faker.internet.password({ length: 10 }),
                JWT_pass_code: faker.internet.password({ length: 32 }),
                JWT_duration: 24
            }
        }

        let mainDir
        if (require.main && require.main.filename) mainDir = path.dirname(require.main.filename);
        else if (process.argv[1]) mainDir = path.dirname(process.argv[1])
        else mainDir = process.cwd()

        if (!mainDir)
        {
            mainDir = process.cwd();
            logger.warn("Cannot determine main file directory, using current working directory");
        }

        const configPath = path.join(mainDir, 'data', 'config.json');

        try
        {
            if (fs.existsSync(configPath))
            {
                logger.info("Configuration file exist")
                const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))
                for(const key of Object.keys(data))
                {
                    this[key] = data[key]
                }
            }
            else
            {
                logger.warn("Configuration file is not exist, creating default config")

                const dataDir = path.join(mainDir, 'data');
                if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

                fs.writeFileSync(configPath, JSON.stringify(this.def, null, 4), 'utf8');
                logger.info("Configuration file created")

                for(const key of Object.keys(this.def))
                {
                    this[key] = this.def[key]
                }
            }
        }
        catch (e)
        {
            logger.error(e)
        }
    }

}

module.exports = new Config()