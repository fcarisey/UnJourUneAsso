export default class Event{

    /**
     *
     * @param {number} id
     * @param {string} title
     * @param {string} description
     * @param {Date} startDateTime
     * @param {Date} endDateTime
     * @param {string} color
     * @param {object} address
     */
    constructor(id, title, description, startDateTime, endDateTime, color, address) {
        this.id = id
        this.title = title
        this.description = description
        this.startDateTime = startDateTime
        this.endDateTime = endDateTime
        this.color = color
        this.address = address
    }
}
