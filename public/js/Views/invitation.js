import App from '../App.js';

App.init(_ => {
    const is_deploy =  _ => {
        const el = document.getElementById('invitation-extra-form')
        return el.classList.contains('is-visible')
    }
    const hash = document.querySelector("*[data-hash]")?.dataset.hash;

    if (!hash) {
        return;
    }

    const btn_accept = document.getElementsByClassName("btn-accept")[0];

    btn_accept.addEventListener("click", e => {
        e.preventDefault();

        const extra = checkExtraData()

        if (is_deploy()){
            void App.fetch.post(`/api/invitation/${hash}/accept`, extra,data => {
                if (!data.success){
                    App.showToast(data.message)
                }

                App.showToast(data.message)
            })
        }else{
            const accept_data = document.getElementById('invitation-extra-form')
            accept_data.classList.add('is-visible');
        }
    })

    const btn_decline = document.getElementsByClassName("btn-decline")[0];
    btn_decline.addEventListener("click", e => {
        e.preventDefault();

        void App.fetch.post(`/api/invitation/${hash}/decline`, {},data => {
            console.log(data)
        })
    })

    function checkExtraData(){
        const accept_data = document.getElementById('invitation-extra-form')

        window.a = accept_data;

        const nb_intervenent = accept_data.querySelector('.invitation-form-input')
        if (!nb_intervenent) {
            return false
        }


        const needs = accept_data.querySelectorAll('.invitation-form-textarea')[0]
        if (!needs) {
            return false
        }

        const other = accept_data.querySelectorAll('.invitation-form-textarea')[1]
        if (!other) {
            return false
        }

        return {
            nb_people: nb_intervenent.value,
            needs: needs.value,
            comment: other.value
        }
    }
})
