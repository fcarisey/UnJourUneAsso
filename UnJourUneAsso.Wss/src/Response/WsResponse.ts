export default class WsResponse {
    success: boolean;
    type: string
    to: string|null;
    data: any

    constructor(success: boolean, type: string, to: string|null, data: any) {
        this.success = success
        this.type = type
        this.to = to
        this.data = data
    }

    public toString(){
        return JSON.stringify({
            success: this.success,
            type: this.type,
            to: this.to,
            data: {
                ...this.data
            }
        })
    }
}