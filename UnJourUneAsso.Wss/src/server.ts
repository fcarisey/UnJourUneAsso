import {WebSocketServer} from 'ws'
import SessionContext from "./Context/SessionContext";
import WebSocketSession from "./Entity/WebSocketSession";
import WsResponseParser from "./Parser/WsResponseParser";
import WsResponse from "./Response/WsResponse";


const wss = new WebSocketServer({
    port: 8080
})

wss.on('connection', ws => {
    console.log('New client connected')
    const current_session = new WebSocketSession(
        Math.random().toString(36).substring(2, 15),
        'anonymous',
        ws
    )

    setTimeout(() => {
        ws.send('Welcome to the WebSocket server!')

        SessionContext.addSession(current_session)
    }, 100)

    ws.on('message', message => {
        console.log(`Received message: ${message}`)

        const ws_response_data = WsResponseParser.parse(message)

        if (ws_response_data === null) {
            ws.send(
                new WsResponse(
                    false,
                    'error',
                    null,
                    {message: 'Invalid message format'}
                ).toString()
            )

            return
        }

        switch (ws_response_data.type) {
            case 'user':
                if (ws_response_data.to === null) {
                    ws.send(
                        new WsResponse(
                            false,
                            'error',
                            null,
                            {message: 'No user id provided'}
                        ).toString()
                    )
                    return
                }

                const to_user = SessionContext.getSessionById(ws_response_data.to)

                if (to_user === null) {
                    ws.send(
                        new WsResponse(
                            false,
                            'error',
                            null,
                            {message: 'User with id ' + ws_response_data.to + ' not found'}
                        ).toString()
                    )
                    return
                }

                SessionContext.sendToOne(ws_response_data.data, to_user)
                break
            case 'broadcast':
                SessionContext.sendToAll(ws_response_data.data, current_session)
                break
            case 'init':
                current_session.userId = ws_response_data.data.id || 'anonymous'
                break
            default:
                ws.send(
                    new WsResponse(
                        false,
                        'error',
                        null,
                        {message: 'Unknown message type'}
                    ).toString()
                )
                return
        }
    })

    ws.on('error', err => {
        console.error(err)
        SessionContext.deleteSession(current_session)
    })

    ws.on('close', () => {
        console.log('Client disconnected')
        SessionContext.deleteSession(current_session)
    })
})

console.log('WebSocket server is running on ws://localhost:8080')
