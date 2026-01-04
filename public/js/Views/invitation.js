import App from '../App.js';

App.init(_ => {
    const hash = document.querySelector("*[data-hash]")?.dataset.hash;

    if (!hash) {
        return;
    }

    const btn_accept = document.getElementsByClassName("btn-accept")[0];

    btn_accept.addEventListener("click", e => {
        e.preventDefault();

        void App.fetch.get(`/api/invitation/${hash}/accept`, data => {
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
})
