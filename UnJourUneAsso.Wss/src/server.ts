import WebSocket, {WebSocketServer} from 'ws'

const wss = new WebSocketServer({
    port: 8080
})

let AllClients: WebSocket[] = []

wss.on('connection', ws => {
    console.log('New client connected')

    setTimeout(() => {
        ws.send('Welcome to the WebSocket server!')
        AllClients.push(ws)
    }, 100)

    ws.on('message', message => {
        console.log(`Received message: ${message}`)
        ws.send(`Echo: ${message}`)

        // Broadcast to all connected clients
        AllClients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(`Broadcast: ${message}`)
            }
        })
    })

    ws.on('error', err => {
        console.error(err)
    })

    ws.on('close', () => {
        console.log('Client disconnected')
    })
})

console.log('WebSocket server is running on ws://localhost:8080')
