import WsResponse from "../Models/WsResponse.js";
import App from "../App.js";

export default class WebSocketService extends WebSocket {
    constructor() {
        super('ws://localhost:8080');
    }

    /**
     *
     * @param {function(WsResponse)} callback
     */
    onMessage(callback){
        this.onmessage = e => {
            try{
                const ws_reponse = new WsResponse(JSON.parse(e.data));

                if (callback && typeof callback === "function") {
                    callback(ws_reponse);
                }
            }catch(e){
                console.debug("WebSocketService Error: "+e.message);
                App.showToast("Erreur du système de notification !");
            }
        };
    }

    /**
     *
     * @param {object} data
     * @param {string} type
     * @param {string} to
     */
    sendTo(data, type, to) {
        this.#send(true, type, data, to)
    }

    /**
     *
     * @param {object} data
     * @param {string} type
     * @param {string} to
     */
    sendErrorTo(data, type, to) {
        this.#send(false, type, data, to)
    }


    /**
     * @param {boolean} success
     * @param {string} type
     * @param {object} data
     * @param {string} to
     */
    #send(success, type, data, to){
        super.send(JSON.stringify({
            success: success,
            type: type,
            to: to,
            data: {
                ...data
            }
        }))
    }
}
