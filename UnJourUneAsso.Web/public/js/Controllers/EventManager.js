import Event from '../Models/Event.js';

export default class EventManager extends EventTarget{

    /**
     * @type Event[]
     */
    events

    constructor(){
        super();
        this.init()
    }

    init(){
        this.events = []
    }

    hasEvent(year, month, day){
        return this.events.some(event => {
            const event_date = new Date(event.startDateTime)
            return event_date.getFullYear() === year &&
                event_date.getMonth() === month &&
                event_date.getDate() === day
        })
    }

    getEvent(year, month, day){
        return this.events.filter(event => {
            const event_date = new Date(event.startDateTime)
            return event_date.getFullYear() === year &&
                event_date.getMonth() === month &&
                event_date.getDate() === day
        })
    }

    addEvent(event_data){
        this.events.push(new Event(
            event_data.id,
            event_data.title,
            event_data.description,
            event_data.startDateTime,
            event_data.endDateTime,
            event_data.color
        ));

        this.dispatchEvent(new window.Event('new-event'))
    }

    updateEvent(event_id, event_data){
        const index = this.events.findIndex(event => event.id === event_id)

        if (index !== -1){
            this.events[index] = new Event(
                event_data.id,
                event_data.title,
                event_data.description,
                event_data.startDateTime,
                event_data.endDateTime,
                event_data.color
            )

            this.dispatchEvent(new window.Event('update-event'))
        }
    }

    deleteEvent(event_id){
        this.events = this.events.filter(event => event.id !== event_id)

        this.dispatchEvent(new window.Event('delete-event'))
    }

    clearEvent(){
        this.events = []

        this.dispatchEvent(new window.Event('clear-event'))
    }
}
