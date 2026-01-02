import NotificationHTMLElement from './Elements/NotificationHTMLElement.js'

export default class App {

    static #FETCH_DEFAULT_HEADERS = {
        "accept": "application/json",
        "content-type": "application/json",
    }

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

    /**
     * @callback responseCallback
     * @param {Object} data JSON reponse
     */

    /**
     *
     * @param {string} url
     * @param {FormData|Object} data
     * @param {string} method
     * @param {responseCallback} responseCallback
     * @param {Object} [headers]
     */
    static async #fetch (url, data, method, responseCallback = _ => {}, headers = {}){
        if (!(data instanceof FormData)) {
            data = JSON.stringify(data);
        }

        let init = {
            method: method,
            headers: headers
        }

        if (method !== 'GET' && data !== undefined && data.length > 0){
            init['body'] = data;
        }

        fetch(url, init).then(async response => {
            if (!response.ok) {
                console.error(`Error occurred while fetching ${method}`, false);
                App.showToast(`Une erreur s'est produite lors de la récupération ${method}.`, false);

                throw new Error("Error occurred while fetching");
            }

            const contentType = response.headers.get('content-type');

            if (!contentType.includes('application/json')) {
                return {type: 'text', data: await response.text()};
            }

            return {type: 'json', data: await response.json()};
        }).then(({type, data}) => {
            if (type !== 'json'){
                console.error("Une erreur server est survenue !")
                console.error(data)
                App.showToast(`Une erreur server est survenue !`, false);

                throw new Error('A server error occurred !');
            }

            if (!data.success){
                console.error(data.message);
            }

            responseCallback(data);
        }).catch(error => {
            console.error(error.message);
            App.showToast("Une erreur réseau est survenue.", false);

            throw error;
        })
    }

    /**
     *
     * @param {string} url
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async fetchGET(url, responseCallback= _ => {}, headers = App.#FETCH_DEFAULT_HEADERS) {
        await App.#fetch(url, {}, 'GET', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async fetchPOST(url, data= {}, responseCallback= _ => {}, headers = App.#FETCH_DEFAULT_HEADERS) {
        await App.#fetch(url, data, 'POST', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async fetchDELETE(url, data= {}, responseCallback= _ => {}, headers = App.#FETCH_DEFAULT_HEADERS) {
        await App.#fetch(url, data, 'DELETE', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async fetchPATCH(url, data= {}, responseCallback= _ => {}, headers = App.#FETCH_DEFAULT_HEADERS) {
        await App.#fetch(url, data, 'PATCH', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async fetchPUT(url, data= {}, responseCallback= _ => {}, headers = App.#FETCH_DEFAULT_HEADERS) {
        await App.#fetch(url, data, 'PUT', responseCallback, headers);
    }
}
document.addEventListener('DOMContentLoaded', _ => {
    try{
        App.boot();
        window.App = App;
    }
    catch (e){
        console.error(e);
    }
})
