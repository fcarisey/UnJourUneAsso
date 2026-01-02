import NotificationHTMLElement from './Elements/NotificationHTMLElement.js'
import FetchService from "./Services/FetchService.js";

export default class App {
    static fetch = FetchService

    /**
     *
     * @param {Function} callback
     */
    static init(callback){
        if (typeof callback === 'function') {
            App.callback = callback();
        }else{
            console.error("Unable to initialize root element. Callback must be a function !");
            throw new Error('Unable to initialize root element. Callback must be a function !');
        }
    }

    static boot(){
        if (App.callback){
            App.callback();
        }
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
        console.error(e);
    }
})
