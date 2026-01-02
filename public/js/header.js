import App from "./App.js"

App.init(_ => {
    const burgerBtn = document.getElementById('burger-btn');
    const mainNav = document.getElementById('main-nav');

    if (burgerBtn && mainNav) {
        burgerBtn.addEventListener('click', function() {
            const isActive = this.classList.toggle('active');
            mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', isActive);

            // Empêcher le scroll du body quand le menu est ouvert
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Fermer le menu lors du clic sur un lien
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerBtn.classList.remove('active');
                mainNav.classList.remove('active');
                burgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Fermer le menu lors du clic en dehors
        document.addEventListener('click', function(event) {
            if (!mainNav.contains(event.target) && !burgerBtn.contains(event.target)) {
                if (mainNav.classList.contains('active')) {
                    burgerBtn.classList.remove('active');
                    mainNav.classList.remove('active');
                    burgerBtn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });

        // Fermer le menu lors du redimensionnement de la fenêtre (retour au desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                burgerBtn.classList.remove('active');
                mainNav.classList.remove('active');
                burgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
})
