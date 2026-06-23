class Logger
{
    constructor()
    {
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m'
        }
    }

    getTimestamp()
    {
        const now = new Date();
        const pad = (n, len = 2) => String(n).padStart(len, '0')
        const hours = pad(now.getHours())
        const minutes = pad(now.getMinutes())
        const seconds = pad(now.getSeconds())
        const ms = pad(now.getMilliseconds(), 3)
        return `${hours}:${minutes}:${seconds}.${ms}`
    }

    done(message)
    {
        console.log(`${this.getTimestamp()} ${this.colors.green}[DONE]${this.colors.reset} ${message}`)
    }

    info(message)
    {
        console.log(`${this.getTimestamp()} ${this.colors.blue}[INFO]${this.colors.reset} ${message}`)
    }

    warn(message)
    {
        console.log(`${this.getTimestamp()} ${this.colors.yellow}[WARN]${this.colors.reset} ${message}`)
    }

    error(message)
    {
        if(typeof message === 'string')
        {
            console.error(`${this.getTimestamp()} ${this.colors.red}[ERROR]${this.colors.reset} ${message}`)
        }
        else
        {
            console.error(`${this.getTimestamp()} ${this.colors.red}[ERROR]${this.colors.reset}`)
            console.error(message)
        }
    }
}

module.exports = new Logger()