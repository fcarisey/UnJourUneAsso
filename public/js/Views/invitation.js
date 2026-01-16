import App from '../App.js';

App.init(_ => {
    const hash = document.querySelector("*[data-hash]")?.dataset.hash;

    if (!hash) {
        return;
    }

    const btn_accept = document.getElementsByClassName("btn-accept")[0];

    btn_accept.addEventListener("click", e => {
        e.preventDefault();

        const [check_extra, extra] = !checkExtraData()

        if (!check_extra) {
            const accept_data = document.getElementById('invitation-extra-form')
            accept_data.classList.add('is-visible');
        }

        void App.fetch.post(`/api/invitation/${hash}/accept`, extra,data => {
            console.log(data)
        })
    })

    const btn_decline = document.getElementsByClassName("btn-decline")[0];
    btn_decline.addEventListener("click", e => {
        e.preventDefault();

        void App.fetch.get(`/api/invitation/${hash}/decline`, data => {
            console.log(data)
        })
    })

    function checkExtraData(){
        const accept_data = document.getElementById('invitation-extra-form')

        const nb_intervenent = accept_data.querySelector('.invitation-form-input')
        if (!nb_intervenent) {
            return false
        }

        try{
            Number(nb_intervenent.value)
        }catch(_){
            return false
        }


        const needs = accept_data.querySelector('.invitation-form-textarea:first-child')
        if (!needs || needs.value === "") {
            return false
        }

        const other = accept_data.querySelector('.invitation-form-textarea:last-child')
        if (!other || other.value === "") {
            return false
        }

        return [true, {
            nb_intervenent: nb_intervenent.value,
            needs: nb_intervenent.value,
            other: nb_intervenent.value
        }]
    }
})
