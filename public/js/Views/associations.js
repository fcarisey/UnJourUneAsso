import App from '../App.js'

App.init(_ => {
    // Données temporaires des associations (à remplacer par des appels API)
    const associationsData = {};

    const loader = document.getElementById('associationsLoader');
    // loader.classList.remove('hide');

    // First load
    loadAllAssociations();

    // Gestion de la recherche
    const searchInput = document.getElementById('searchAssociations');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            let searchTerm = e.target.value;
            const searchTerm_replaced = searchTerm.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

            if (searchTerm !== searchTerm_replaced){
                e.target.value = searchTerm_replaced;
                return;
            }

            searchTerm.toLowerCase();

            if (searchTerm.length < 1) {
                loadAllAssociations();
                return;
            }

            void App.fetch.get(`/api/associations/search/${searchTerm}`, data => {
                if (!data.success) {
                    App.showToast(data.message, false);
                }

                if (!data.data.associations) {
                    const associations_grid = document.getElementById('associationsGrid');
                    associations_grid.innerHTML = 'Aucune association';
                }

                const state_value = document.querySelector('div.stat-value');
                state_value.innerText = data.data.associations.length;

                clearAssociations();

                data.data.associations.forEach(association => {

                    buildAssociationElement(
                        association.id,
                        association.name,
                        association.description,
                        association.email
                    )
                })
            })
        });
    }

    // Gestion du formulaire d'ajout d'association
    const addForm = document.getElementById('addAssociationForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('associationName').value;
            const email = document.getElementById('associationEmail').value;
            const description = document.getElementById('associationDescription').value;

            void App.fetch.post('/api/association', {
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

                    buildAssociationElement(
                        data.association_id,
                        name,
                        description,
                        email
                    );

                    App.showToast(data.message);
                }
            )
        });
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

        void App.fetch.patch(`/api/association/${associationId}`, {
            associationId: associationId,
            name: name,
            email: email,
            description: description,
        }, data => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
            modal.hide();

            App.showToast(data.message);
        });
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

            void App.fetch.delete(`/api/association/${associationId}`, {
                associationId: associationId,
            }, data => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
                modal.hide();

                App.showToast(data.message);
            });
        }
    });

    function loadAllAssociations() {
        void App.fetch.get('/api/associations', data => {
            if (!data.success){
                App.showToast(data.message, false);
            }

            if (!data.associations) {
                App.showToast("Résultat inattendu lors de la récupération des associations.", false);
            }

            const empty_state = document.querySelector('div.empty-state');

            if (data.associations.length > 0) {
                empty_state.style.display = 'none';
            }else{
                empty_state.style.display = 'block';
            }

            const state_value = document.querySelector('div.stat-value');
            state_value.innerText = data.associations.length;

            clearAssociations();
            data.associations.forEach(association => {
                buildAssociationElement(
                    association.id,
                    association.name,
                    association.description,
                    association.email
                )
            });
            loader.classList.add('hide');
        });
    }

    function buildAssociationElement(id, name, description, email) {
        associationsData[id] = {
            id: id,
            name: name,
            description: description,
            email: email
        };

        const association_template = document.getElementById('association_template');
        const association_grid = document.getElementById('associationsGrid');

        const association_template_clone = association_template.cloneNode(true);
        const association_element = association_template_clone.content.querySelector(':first-child');

        association_element.dataset.name = name.toLowerCase();
        association_element.dataset.id = id;

        const title_element = association_element.querySelector('h3.association-name');
        title_element.textContent = name;

        const email_element = association_element.querySelector('p.association-email');
        email_element.textContent = email;

        const description_element = association_element.querySelector('p.association-description');
        description_element.textContent = description;

        const btn_view = association_element.querySelector('button.btn-view');
        btn_view.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            openViewModal(id);
        });

        const btn_edit = association_element.querySelector('button.btn-edit');
        btn_edit.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            openEditModal(id);
        });

        association_grid.insertAdjacentElement('afterbegin', association_element);
    }

    function clearAssociations() {
        const association_grid = document.getElementById('associationsGrid');
        association_grid.innerHTML = '';
    }

    function openViewModal(associationId) {
        const association = associationsData[associationId];
        if (!association) return;

        document.getElementById('viewAssociationName').textContent = association.name;
        document.getElementById('viewAssociationDescription').textContent = association.description;
        document.getElementById('viewAssociationId').textContent = `#${association.id}`;

        // Stocker l'ID pour le bouton "Modifier" dans la modale de visualisation
        document.getElementById('btnOpenEditFromView').dataset.associationId = associationId;

        const modal = new bootstrap.Modal(document.getElementById('viewAssociationModal'));
        modal.show();
    }

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
});
