import NotificationService from "../Services/NotificationService.js";
import NotificationHTMLElement from "../Components/NotificationHTMLElement.js";
import FetchService from "../Services/FetchService.js";

/**
 * Check if the extra data form is correctly filled and return the data
 * @returns false if the form is not correctly filled
 */
function checkExtraData(): {nb_people: string, needs: string, comment: string}|false{
    const accept_data = document.getElementById('invitation-extra-form')

    const nb_intervenent: HTMLInputElement|null|undefined = accept_data?.querySelector('.invitation-form-input')
    if (!nb_intervenent) {
        return false;
    }


    const needs: HTMLTextAreaElement|null = <HTMLTextAreaElement|null>accept_data?.querySelectorAll('.invitation-form-textarea')[0]
    if (!needs) {
        return false;
    }

    const other: HTMLTextAreaElement|null = <HTMLTextAreaElement|null>accept_data?.querySelectorAll('.invitation-form-textarea')[1]
    if (!other) {
        return false;
    }

    return {
        nb_people: nb_intervenent.value,
        needs: needs.value,
        comment: other.value
    }
}

document.addEventListener('DOMContentLoaded', _ => {
    const is_deploy = () => {
        const el = document.getElementById('invitation-extra-form')
        if (!el) {
            console.error('Element does not exist')
            return false
        }

        return el.classList.contains('is-visible')
    }

    const hash: string|undefined = (<HTMLElement>document.querySelector("*[data-hash]"))?.dataset.hash;
    if (!hash) {
        return;
    }

    const btn_accept = document.getElementsByClassName("btn-accept")[0];
    btn_accept.addEventListener("click", e => {
        e.preventDefault();

        const extra = checkExtraData()
        if (!extra){
            console.error('Form is not correctly filled')
            return;
        }

        if (is_deploy()){
            FetchService.post(`/api/invitation/${hash}/accept`, extra)
                .then(data => {
                    if (!data.success){
                        NotificationService.notify(new NotificationHTMLElement(false, data.message));
                    }

                    NotificationService.notify(new NotificationHTMLElement(true, data.message));
                    // App.ws.send(JSON.stringify(extra))
                }
            );
        }else{
            const accept_data = document.getElementById('invitation-extra-form')
            if (!accept_data) {
                console.error('Element does not exist');
                return;
            }
            accept_data.classList.add('is-visible');
        }
    })

    const btn_decline = document.getElementsByClassName("btn-decline")[0];
    btn_decline.addEventListener("click", e => {
        e.preventDefault();

        FetchService.post(`/api/invitation/${hash}/decline`, {})
            .then(data => {
                console.log(data);
            }
        )
    })


})
