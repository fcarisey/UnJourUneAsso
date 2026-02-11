import NotificationHTMLElement from './Elements/NotificationHTMLElement.js'
import FetchService from "./Services/FetchService.js";
import EventManager from "./Controllers/EventManager.js";
import WebSocketService from "./Services/WebSocketService.js";

export default class App {
    static fetch = FetchService
    static eventController
    static ws

    /**
     *
     * @param {Function} callback
     */
    static init(callback){
        if (typeof callback === 'function') {
            App.callback = callback()

            App.eventController = new EventManager()

        }else{
            console.error("Unable to initialize root element. Callback must be a function !")
            throw new Error('Unable to initialize root element. Callback must be a function !')
        }
    }

    static boot(){
        App.ws = new WebSocketService()

        if (App.callback){
            App.callback()
        }

        this.eventController.init()

        App.ws.onMessage(ws_response => {
            App.showToast(ws_response.data.message)
        })
    }

    /**
     *
     * @param {string} message
     * @param {boolean} success
     */
    static showToast(message, success = true){
        const toast = new NotificationHTMLElement();
        toast.setAttribute('aria-message', message);
        toast.setAttribute('aria-success', `${success.toString()}`);

        document.body.querySelector('main').insertAdjacentElement('afterbegin', toast);
    }
}
document.addEventListener('DOMContentLoaded', _ => {
    try{
        App.boot();
    }
    catch (e){
        App.showToast("Oupss, une erreur s'est produite, veuillez rafraichir la page ou contacter l'administrateur !")
        console.error(e);
    }
})
