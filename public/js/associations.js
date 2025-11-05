document.addEventListener('DOMContentLoaded', () => {
    // Données temporaires des associations (à remplacer par des appels API)
    const associationsData = {};

    // Initialiser les données des associations depuis le DOM
    const associationCards = document.querySelectorAll('.association-card');
    associationCards.forEach(card => {
        const id = card.dataset.id;
        const name = card.querySelector('.association-name').textContent;
        const members = card.querySelector('.meta-item span').textContent.split(' ')[0];
        const description = card.querySelector('.association-description').textContent.trim();

        associationsData[id] = {
            id: id,
            name: name,
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
        const description = document.getElementById('editAssociationDescription').value;

        // Mettre à jour les données
        associationsData[associationId].name = name;
        associationsData[associationId].description = description;

        // Mettre à jour le DOM
        const card = document.querySelector(`.association-card[data-id="${associationId}"]`);
        if (card) {
            card.querySelector('.association-name').textContent = name;
            card.querySelector('.association-description').textContent = description;
        }

        // TODO: Appel API pour sauvegarder les modifications
        fetch(`/association/${associationId}/edit`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                associationId: associationId,
                name: name,
                description: description,
            })
        })
        .then(response => {
            if (response.ok) {
                response.json().then((data) => {console.log(data)})
            }
        })
        .catch(error => {
            console.error(error);
        })

        console.log('Association modifiée:', { id: associationId, name, description });

        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
        modal.hide();

        // Afficher un message de succès (optionnel)
        showToast('Association modifiée avec succès', 'success');
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

            // TODO: Appel API pour supprimer l'association
            fetch(`/association/${associationId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    associationId: associationId,
                })
            })
            .then(res => {
                if (res.ok) {
                    res.json().then((data) => {console.log(data)})
                }
            })
            .catch(err => {
                console.log(err);
            })

            console.log('Association supprimée:', associationId);

            // Fermer la modale
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
            modal.hide();

            // Afficher un message de succès
            showToast('Association supprimée avec succès', 'danger');
        }
    });

    // Gestion du formulaire d'ajout d'association
    const addForm = document.getElementById('addAssociationForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('associationName').value;
            const description = document.getElementById('associationDescription').value;

            // TODO: Appel API pour créer l'association
            fetch('/association/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                })
            })
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        console.log(data);
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })


            console.log('Nouvelle association:', { name, description });

            // Fermer la modale
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAssociationModal'));
            modal.hide();

            // Réinitialiser le formulaire
            addForm.reset();

            // Afficher un message de succès
            showToast('Association créée avec succès', 'success');
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

    // Fonction utilitaire pour afficher des toasts (notifications)
    function showToast(message, type = 'success') {
        // Créer un toast Bootstrap si vous voulez
        // Pour l'instant, on utilise un simple log
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Alternative: utiliser une bibliothèque de notifications ou créer un toast personnalisé
        // Exemple avec un toast simple:
        const toastHtml = `
            <div class="toast-notification" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
        `;

        const toast = document.createElement('div');
        toast.innerHTML = toastHtml;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
