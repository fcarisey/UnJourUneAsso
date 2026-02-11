import WebSocket from "ws";

export default class WebSocketSession{
    id: string
    userId: string
    ws: WebSocket

    constructor(id: string, userId: string, ws: WebSocket){
        this.id = id
        this.userId = userId
        this.ws = ws
    }
}
