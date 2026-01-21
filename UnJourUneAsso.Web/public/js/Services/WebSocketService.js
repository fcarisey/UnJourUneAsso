import WsResponse from "../Models/WsResponse.js";
import App from "../App.js";

export default class WebSocketService extends WebSocket {
    constructor() {
        super('ws://localhost:8080')

        this.#init()
    }

    #init(){
        this.onopen = _ => {
            this.onerror = e => {
                console.error("WS error: " + e)
            }

            this.onclose = e => {
                console.log('Close App:', e.code, e.reason)
            }
        }

        void App.fetch.get('/api/user/whois', response => {

            const user_id = response.data.userId

            this.#send(true, 'init', {'id': user_id});
        })

    }

    /**
     *
     * @param {function(WsResponse)} callback
     */
    onMessage(callback){
        this.onmessage = e => {
            try{
                if (e.data === "Welcome to the WebSocket server!"){
                    return
                }

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
     * @param {?string} to
     */
    #send(success, type, data, to = null){
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
