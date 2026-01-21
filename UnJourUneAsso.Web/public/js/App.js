import NotificationHTMLElement from './Elements/NotificationHTMLElement.js'
import FetchService from "./Services/FetchService.js";
import EventManager from "./Controllers/EventManager.js";
import WebSocketService from "./Services/WebSocketService.js";

export default class App {
    static fetch = FetchService
    static eventController = new EventManager()
    static ws = new WebSocketService()

    /**
     *
     * @param {Function} callback
     */
    static init(callback){
        if (typeof callback === 'function') {
            App.callback = callback()
        }else{
            console.error("Unable to initialize root element. Callback must be a function !")
            throw new Error('Unable to initialize root element. Callback must be a function !')
        }
    }

    static boot(){
        if (App.callback){
            App.callback()
        }

        this.eventController.init()

        App.ws.addEventListener('open', _ => {
            console.log('Connexion établie');
            App.ws.send("ping")

            App.ws.addEventListener('message', e => {
                console.log(e.data)
                App.showToast(e.data)
            })

            App.ws.addEventListener('error', error => {
                console.error('Erreur:', error)
            })

            App.ws.addEventListener('close', e => {
                console.log('Close App:', e.code, e.reason)
            })
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
