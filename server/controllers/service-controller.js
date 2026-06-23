const {WebSocketServer} = require('ws')
const jwt = require('jsonwebtoken')
const config = require('../modules/config')

class ServiceController
{
    constructor()
    {
        this.socket = new WebSocketServer({ noServer: true })
        this.socket.on("connection", this.connection.bind(this))
    }

    connection(ws, request)
    {
        ws.user = request.user
    }

    async authenticate(request, socket, head)
    {
        try
        {
            const token = request.headers?.authorization?.split(" ")[1]

            if(!token)
            {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
            socket.user = jwt.verify(token, config.encryption.JWT_pass_code)

            this.socket.handleUpgrade(request, socket, head, () => {})
        }
        catch(e)
        {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
        }

    }

    async broadcast(userId, message)
    {
        for(const client of this.socket.clients)
        {
            if (client.readyState !== WebSocket.OPEN) continue
            if (client?._socket?.user?.id === userId)
            client.send(message)
        }
    }
}

module.exports = new ServiceController()