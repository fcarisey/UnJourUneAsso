import WebSocketSession from "../Entity/WebSocketSession";
import WsResponse from "../Response/WsResponse";

export default class SessionContext{
    static sessions: WebSocketSession[] = []

    static addSession(session: WebSocketSession){
        this.sessions.push(session)
    }

    static deleteSession(session: WebSocketSession){
        this.sessions = this.sessions.filter(s => s !== session)
    }

    static sendToAll(message: string, current_session: WebSocketSession, self = false){
        const response = new WsResponse(
            true,
            'broadcast',
            null,
            message
        )

        if (!self){
            this.sessions.forEach(session => {
                if (session !== current_session){
                    session.ws.send(response.toString())
                }
            })
        }else{
            this.sessions.forEach(session => {
                session.ws.send(response.toString())
            })
        }
    }

    static sendToOne(message: string, to_session: WebSocketSession){
        const response = new WsResponse(
            true,
            'user',
            to_session.id,
            message
        )

        to_session.ws.send(response.toString())
    }

    static getSessionById(sessionId: string): WebSocketSession | null{
        return this.sessions.find(s => s.userId === sessionId) || null
    }
}
