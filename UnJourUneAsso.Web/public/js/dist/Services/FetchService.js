import NotificationService from "./NotificationService.js";
import NotificationHTMLElement from "../Components/NotificationHTMLElement.js";
export default class FetchService {
    static #FETCH_DEFAULT_HEADERS = {
        "accept": "application/json",
        "content-type": "application/json",
    };
    /**
     * @param {string} url
     * @param {FormData|Object} data
     * @param {string} method
     * @param {Object} [headers]
     */
    static async #fetch(url, data, method, headers = {}) {
        let data_json;
        if (!(data instanceof FormData)) {
            data_json = JSON.stringify(data);
        }
        let init = {
            method: method,
            headers: headers,
        };
        if (method !== 'GET' && data_json !== undefined && data_json.length > 0) {
            init.body = data_json;
        }
        return fetch(url, init).then(response => {
            if (!response.ok) {
                console.error(`Error occurred while fetching ${method}`, false);
                NotificationService.notify(new NotificationHTMLElement(false, `Une erreur s'est produite lors de la récupération ${method}.`));
                throw new Error("Error occurred while fetching");
            }
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                return {
                    type: 'text',
                    data: response.text()
                };
            }
            return {
                type: 'json',
                data: response.json()
            };
        }).then(({ type, data }) => {
            if (type !== 'json') {
                NotificationService.notify(new NotificationHTMLElement(false, `Une erreur serveur est survenue, réponse inattendue !`));
                throw new Error('A server error occurred !');
            }
            return data;
        }).catch(error => {
            console.error(error.message);
            NotificationService.notify(new NotificationHTMLElement(false, `Une erreur réseau est survenue.`));
            throw error;
        });
    }
    /**
     *
     * @param {string} url
     * @param {Object} [headers]
     */
    static async get(url, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        return FetchService.#fetch(url, {}, 'GET', {
            ...FetchService.#FETCH_DEFAULT_HEADERS,
        });
    }
    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {Object} [headers]
     */
    static async post(url, data = {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        return FetchService.#fetch(url, data, 'POST', {
            ...FetchService.#FETCH_DEFAULT_HEADERS,
        });
    }
    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {Object} [headers]
     */
    static async delete(url, data = {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        return FetchService.#fetch(url, data, 'DELETE', {
            ...FetchService.#FETCH_DEFAULT_HEADERS,
        });
    }
    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {Object} [headers]
     */
    static async patch(url, data = {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        return FetchService.#fetch(url, data, 'PATCH', {
            ...FetchService.#FETCH_DEFAULT_HEADERS,
        });
    }
    /**
     *
     * @param {string} url
     * @param {FormData|Object} [data]
     * @param {Object} [headers]
     */
    static async put(url, data = {}, headers = FetchService.#FETCH_DEFAULT_HEADERS) {
        return FetchService.#fetch(url, data, 'PUT', {
            ...FetchService.#FETCH_DEFAULT_HEADERS,
        });
    }
}
