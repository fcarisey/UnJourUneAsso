import App from "./App.js"

App.init(_ => {
    // Données temporaires des associations (à remplacer par des appels API)
    const associationsData = {};

    // Initialiser les données des associations depuis le DOM
    const associationCards = document.querySelectorAll('.association-card');
    associationCards.forEach(card => {
        const id = card.dataset.id;
        const name = card.querySelector('.association-name').textContent;
        const email = card.querySelector('.association-email').textContent;
        const members = card.querySelector('.meta-item span').textContent.split(' ')[0];
        const description = card.querySelector('.association-description').textContent.trim();

        associationsData[id] = {
            id: id,
            name: name,
            email: email,
            members: members,
            description: description,
            createdAt: new Date().toLocaleDateString('fr-FR')
        };
    });

    // Gestion des boutons "Voir"
    const btnViews = document.querySelectorAll('.btn-view');
    btnViews.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.association-card');
            const associationId = card.dataset.id;
            openViewModal(associationId);
        });
    });

    // Gestion des boutons "Modifier"
    const btnEdits = document.querySelectorAll('.btn-edit');
    btnEdits.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.association-card');
            const associationId = card.dataset.id;
            openEditModal(associationId);
        });
    });

    // Fonction pour ouvrir la modale de visualisation
    function openViewModal(associationId) {
        const association = associationsData[associationId];
        if (!association) return;

        document.getElementById('viewAssociationName').textContent = association.name;
        document.getElementById('viewAssociationMembers').textContent = association.members;
        document.getElementById('viewAssociationDescription').textContent = association.description;
        document.getElementById('viewAssociationCreatedAt').textContent = association.createdAt;
        document.getElementById('viewAssociationId').textContent = `#${association.id}`;

        // Stocker l'ID pour le bouton "Modifier" dans la modale de visualisation
        document.getElementById('btnOpenEditFromView').dataset.associationId = associationId;

        const modal = new bootstrap.Modal(document.getElementById('viewAssociationModal'));
        modal.show();
    }

    // Fonction pour ouvrir la modale de modification
    function openEditModal(associationId) {
        const association = associationsData[associationId];
        if (!association) return;

        document.getElementById('editAssociationId').value = associationId;
        document.getElementById('editAssociationName').value = association.name;
        document.getElementById('editAssociationEmail').value = association.email;
        document.getElementById('editAssociationDescription').value = association.description;

        // Fermer la modale de visualisation si elle est ouverte
        const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewAssociationModal'));
        if (viewModal) {
            viewModal.hide();
        }

        const modal = new bootstrap.Modal(document.getElementById('editAssociationModal'));
        modal.show();
    }

    // Bouton "Modifier" depuis la modale de visualisation
    document.getElementById('btnOpenEditFromView').addEventListener('click', () => {
        const associationId = document.getElementById('btnOpenEditFromView').dataset.associationId;
        openEditModal(associationId);
    });

    // Gestion du formulaire de modification
    document.getElementById('editAssociationForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const associationId = document.getElementById('editAssociationId').value;
        const name = document.getElementById('editAssociationName').value;
        const email = document.getElementById('editAssociationEmail').value;
        const description = document.getElementById('editAssociationDescription').value;

        // Mettre à jour les données
        associationsData[associationId].name = name;
        associationsData[associationId].email = email;
        associationsData[associationId].description = description;

        // Mettre à jour le DOM
        const card = document.querySelector(`.association-card[data-id="${associationId}"]`);
        if (card) {
            card.querySelector('.association-name').textContent = name;
            card.querySelector('.association-email').textContent = email;
            card.querySelector('.association-description').textContent = description;
        }

        void App.fetchPATCH(`association/${associationId}/edit`, {
            associationId: associationId,
            name: name,
            email: email,
            description: description,
        }, data => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
            modal.hide();

            console.log('Association modifiée:', { id: associationId, name, description });
            App.showToast(data.message);
        })
    });

    // Gestion du bouton de suppression
    document.getElementById('btnDeleteAssociation').addEventListener('click', () => {
        const associationId = document.getElementById('editAssociationId').value;
        const association = associationsData[associationId];

        if (confirm(`Êtes-vous sûr de vouloir supprimer l'association "${association.name}" ?`)) {
            // Supprimer du DOM
            const card = document.querySelector(`.association-card[data-id="${associationId}"]`);
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                    // Mettre à jour le compteur
                    const statValue = document.querySelector('.stat-value');
                    if (statValue) {
                        statValue.textContent = document.querySelectorAll('.association-card').length;
                    }
                }, 300);
            }

            // Supprimer des données
            delete associationsData[associationId];

            void App.fetchDELETE(`/association/${associationId}/delete`, {
                associationId: associationId,
            }, data => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
                modal.hide();

                console.log('Association supprimée:', associationId);
                App.showToast(data.message);
            });
        }
    });

    // Gestion du formulaire d'ajout d'association
    const addForm = document.getElementById('addAssociationForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('associationName').value;
            const email = document.getElementById('associationEmail').value;
            const description = document.getElementById('associationDescription').value;

            void App.fetchPOST('/association/create', {
                    name: name,
                    email: email,
                    description: description,
                },
                data => {
                    // Fermer la modale
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addAssociationModal'));
                    modal.hide();

                    // Réinitialiser le formulaire
                    addForm.reset();

                    console.log('Nouvelle association:', { name, description });
                    App.showToast(data.message);
                }
            )
        });
    }

    // Gestion de la recherche
    const searchInput = document.getElementById('searchAssociations');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            associationCards.forEach(card => {
                const name = card.dataset.name;
                if (name.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
