document.addEventListener("DOMContentLoaded", function() {
    const hash = document.querySelector("*[data-hash]").dataset.hash;

    const btn_accept = document.getElementsByClassName("btn-accept")[0];

    btn_accept.addEventListener("click", e => {
        e.preventDefault();

        fetch( `./${hash}/accept`)
        .then(res =>
            res.json().then(data => {
                if (!data.success)
                    console.error("Failed to fetch data.");

                console.log(data)
                document.refresh();
            })
        )
        .catch(err => console.error(err));
    })

    const btn_decline = document.getElementsByClassName("btn-decline")[0];
    btn_decline.addEventListener("click", e => {
        e.preventDefault();

        fetch( `./${hash}/decline`)
        .then(res => res.json().then(data => {
            if (!data.success)
                console.error("Failed to fetch data.");

            console.log(data);
            document.refresh();
        }))
        .catch(err => console.error(err));
    })
})


