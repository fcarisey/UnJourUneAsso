import WsResponse from "../Response/WsResponse";

export default class WsResponseParser {
    static parse(response: any): WsResponse | null  {
        try{
            const json_data = JSON.parse(response)

            return new WsResponse(
                json_data.success,
                json_data.type,
                json_data.to,
                json_data.data
            )
        }catch(err){
            return null
        }
    }
}
