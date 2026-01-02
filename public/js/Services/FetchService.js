export default class FetchService {
    static #FETCH_DEFAULT_HEADERS = {
        "accept": "application/json",
        "content-type": "application/json",
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
    static async get(url, responseCallback= _ => {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        await FetchService.#fetch(url, {}, 'GET', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async post(url, data= {}, responseCallback= _ => {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        await FetchService.#fetch(url, data, 'POST', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async delete(url, data= {}, responseCallback= _ => {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        await FetchService.#fetch(url, data, 'DELETE', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async patch(url, data= {}, responseCallback= _ => {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        await FetchService.#fetch(url, data, 'PATCH', responseCallback, headers);
    }

    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {responseCallback} [responseCallback]
     * @param {Object} [headers]
     */
    static async put(url, data= {}, responseCallback= _ => {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        await FetchService.#fetch(url, data, 'PUT', responseCallback, headers);
    }
}
