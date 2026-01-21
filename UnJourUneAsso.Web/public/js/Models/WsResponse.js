export default class WsResponse {
    success
    type
    to
    data

    /**
     *
     * @param {object} json
     */
    constructor(json) {
        this.success = json.success;
        this.type = json.type;
        this.to = json.to;
        this.data = json.data;
    }

    toString(){
        return JSON.stringify({
            success: this.success,
            type: this.type,
            to: this.to,
            data:{
                ...this.data
            }
        })
    }
}
