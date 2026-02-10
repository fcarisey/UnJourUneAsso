import FetchService from "../Services/FetchService.js";
import NotificationService from "../Services/NotificationService.js";
import NotificationHTMLElement from "../Components/NotificationHTMLElement.js";
import IAssociationType from "../Types/AssociationType.js";

declare var bootstrap: any;

const associationsData: IAssociationType[] = [];

/**
 * Ouvre la modale de modification d'une association en pré-remplissant les champs avec les données de l'association sélectionnée.
 * @param associationId
 */
function openEditModal(associationId: any) {
    const association = associationsData[associationId];
    if (!association) return;

    (<HTMLInputElement>document.getElementById('editAssociationId')).value = associationId;
    (<HTMLInputElement>document.getElementById('editAssociationName')).value = association.name;
    (<HTMLInputElement>document.getElementById('editAssociationEmail')).value = association.email;
    (<HTMLInputElement>document.getElementById('editAssociationDescription')).value = association.description;

    // Fermer la modale de visualisation si elle est ouverte
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewAssociationModal'));
    if (viewModal) {
        viewModal.hide();
    }

    const modal = new bootstrap.Modal(document.getElementById('editAssociationModal'));
    modal.show();
}

/**
 * Ouvre la modale de visualisation d'une association en affichant les données de l'association sélectionnée.
 * @param associationId
 */
function openViewModal(associationId: any) {
    const association = associationsData[associationId];
    if (!association) return;

    (<HTMLElement>document.getElementById('viewAssociationName')).textContent = association.name;
    (<HTMLElement>document.getElementById('viewAssociationDescription')).textContent = association.description;
    (<HTMLElement>document.getElementById('viewAssociationId')).textContent = `#${association.id}`;

    // Stocker l'ID pour le bouton "Modifier" dans la modale de visualisation
    const btnEditFromView = document.getElementById('btnOpenEditFromView');
    if (!btnEditFromView) {
        console.error('Élément HTML pour le bouton de modification depuis la modale de visualisation introuvable.');
        return;
    }
    btnEditFromView.dataset.associationId = associationId;

    const modal = new bootstrap.Modal(document.getElementById('viewAssociationModal'));
    modal.show();
}

/**
 * Construit un élément d'association à partir des données fournies et l'ajoute à la grille des associations.
 * @param id
 * @param name
 * @param description
 * @param email
 */
function buildAssociationElement(id: any, name: string, description: string, email: string) {
    associationsData[id] = {
        id: id,
        name: name,
        description: description,
        email: email
    };

    const association_template: HTMLElement|null = document.getElementById('association_template');
    if (!association_template) {
        console.error('Élément HTML pour le template d\'association introuvable.');
        return;
    }


    const association_template_clone = association_template.cloneNode(true);
    const association_element: HTMLElement|null = (<HTMLTemplateElement>association_template_clone).content.querySelector(':first-child');
    if (!association_element) {
        console.error('Élément HTML pour le template d\'association introuvable dans le clone.');
        return;
    }

    association_element.dataset.name = name.toLowerCase();
    association_element.dataset.id = id;

    const title_element = association_element.querySelector('h3.association-name');
    if (!title_element) {
        console.error('Élément HTML pour le nom de l\'association introuvable.');
        return;
    }
    title_element.textContent = name;

    const email_element = association_element.querySelector('p.association-email');
    if (!email_element) {
        console.error('Élément HTML pour l\'email de l\'association introuvable.');
        return;
    }
    email_element.textContent = email;

    const description_element = association_element.querySelector('p.association-description');
    if (!description_element) {
        console.error('Élément HTML pour la description de l\'association introuvable.');
        return;
    }
    description_element.textContent = description;

    const btn_view = association_element.querySelector('button.btn-view');
    if (!btn_view) {
        console.error('Élément HTML pour le bouton de visualisation de l\'association introuvable.');
        return;
    }
    btn_view.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        openViewModal(id);
    });

    const btn_edit = association_element.querySelector('button.btn-edit');
    if (!btn_edit) {
        console.error('Élément HTML pour le bouton de modification de l\'association introuvable.');
        return;
    }
    btn_edit.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        openEditModal(id);
    });

    const association_grid = document.getElementById('associationsGrid');
    if (!association_grid) {
        console.error('Élément HTML pour la grille des associations introuvable.');
        return;
    }

    association_grid.insertAdjacentElement('afterbegin', association_element);
}

/**
 * Efface les éléments d'association actuellement affichés dans la grille.
 */
function clearAssociations() {
    const association_grid: HTMLElement|null = document.getElementById('associationsGrid');
    if (!association_grid) {
        console.error('Élément HTML pour la grille des associations introuvable.');
        return;
    }

    association_grid.innerHTML = '';
}

/**
 * Effectue une recherche d'associations en fonction du terme de recherche et de la page spécifiée.
 * @param searchTerm
 * @param page
 */
function search(searchTerm: string, page: number) {
    FetchService.get(`/api/associations/search/${searchTerm}/${page}/10`).then(data => {
        if (!data.success) {
            NotificationService.notify(new NotificationHTMLElement(false, data.message));
            return;
        }

        if (!data.data.associations) {
            const associations_grid: HTMLElement|null = document.getElementById('associationsGrid');
            if (!associations_grid) {
                console.error('Élément HTML pour la grille des associations introuvable.');
                return;
            }

            associations_grid.innerHTML = 'Aucune association';
        }

        paginate(searchTerm, page, data);

        clearAssociations();

        data.data.associations.forEach((association: IAssociationType) => {
            buildAssociationElement(
                association.id,
                association.name,
                association.description,
                association.email
            )
        })
    });
}

/**
 * Gère la pagination des résultats de recherche ou de la liste complète des associations.
 * @param searchTerm
 * @param page
 * @param data
 * @param searched
 */
function paginate(searchTerm: string, page: number, data: any, searched: boolean = true) {
    const state_value: HTMLElement|null = document.querySelector('div.stat-value');
    if (!state_value) {
        console.error("Élément HTML pour la valeur de l'état introuvable.");
        return;
    }

    state_value.innerText = data.data.associations.length;

    const pagination_element: HTMLElement|null = document.querySelector('ul.pagination');
    if (!pagination_element) {
        console.error("Élément HTML pour la pagination introuvable.");
        return;
    }

    const first_page: HTMLElement|null = pagination_element.querySelector('a.page-link.first');
    if (!first_page) {
        console.error("Élément HTML pour la première page introuvable.");
        return;
    }

    first_page.replaceWith(first_page.cloneNode(true));

    const new_first_page: HTMLElement|null = pagination_element.querySelector('a.page-link.first');
    if (!new_first_page) {
        console.error("Élément HTML pour la première page introuvable après clonage.");
        return;
    }

    new_first_page.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        if (searched) {
            search(searchTerm, 1);
        }else{
            loadAllAssociations();
        }
    });

    const last_page: HTMLElement|null = pagination_element.querySelector('a.page-link.last');
    if (!last_page) {
        console.error("Élément HTML pour la dernière page introuvable.");
        return;
    }

    last_page.replaceWith(last_page.cloneNode(true));

    const new_last_page: HTMLElement|null = pagination_element.querySelector('a.page-link.last');
    if (!new_last_page) {
        console.error("Élément HTML pour la dernière page introuvable après clonage.");
        return;
    }

    new_last_page.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        if (searched) {
            search(searchTerm, data.data.pagination.max_pages);
        }else{
            loadAllAssociations();
        }
    })

    pagination_element.querySelectorAll('li:not(.max)')?.forEach((el) => el.remove());

    const insert_page_element = (html: string) => {
        new_first_page.parentElement?.insertAdjacentHTML('afterend', html);
    }

    if (data.data.pagination.max_pages < 4){
        let html = "";

        for (let i = 0; i < data.data.pagination.max_pages; i++) {
            html += `
                        <li class="page-item"><a class="page-link" href="#">${i+1}</a></li>
                    `;
        }

        insert_page_element(html);
    }else{
        const max_pages = data.data.pagination.max_pages

        const min_pages = (page - 1) === 0
            ? page
            : (page === max_pages)
                ? page - 2
                : page - 1;

        let html = "";

        for (let i = min_pages; i <= page + 1 && i < max_pages; i++) {
            html += `
                        <li class="page-item"><a class="page-link" href="#">${i}</a></li>
                    `
        }

        if (page === max_pages || page === max_pages - 1) {
            html += `
                        <li class="page-item"><a class="page-link" href="#">${max_pages}</a></li>
                    `
        }else{
            html += `
                        <li class="page-item"><a class="page-link dots" href="#">...</a></li>
                        <li class="page-item"><a class="page-link" href="#">${max_pages}</a></li>
                    `
        }

        insert_page_element(`
                    ${html}
                `);
    }

    pagination_element.querySelectorAll('li.page-item>a.page-link:not(.last):not(.first):not(.dots)').forEach((el: Element) => {
        const element = el as HTMLElement;

        if (parseInt(element.innerText) === page){
            element.parentElement?.classList.add('active');
        }

        element.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            try{
                const selected_page = parseInt(element.innerText)

                if (searched) {
                    search(searchTerm, selected_page);
                }else {
                    loadAllAssociations();
                }
            }catch(e){
                NotificationService.notify(new NotificationHTMLElement(false, "Numéro de page invalide."));
                console.error("Erreur lors de la conversion du numéro de page");
            }
        }, {once: true})
    })
}

/**
 * Charge la liste complète des associations avec pagination.
 */
function loadAllAssociations() {
    FetchService.get('/api/associations/paginate/1/10').then(data => {
        if (!data.success){
            NotificationService.notify(new NotificationHTMLElement(false, data.message));
        }

        if (!data.data.associations) {
            NotificationService.notify(new NotificationHTMLElement(false, "Résultat inattendu lors de la récupération des associations."));
        }

        const empty_state: HTMLElement|null = document.querySelector('div.empty-state');
        if (!empty_state) {
            console.error("Élément HTML pour l'état vide introuvable.");
            return;
        }

        if (data.data.associations.length > 0) {
            empty_state.style.display = 'none';
        }else{
            empty_state.style.display = 'block';
        }

        const state_value: HTMLElement|null = document.querySelector('div.stat-value');
        if (!state_value) {
            console.error("Élément HTML pour la valeur de l'état introuvable.");
            return;
        }

        state_value.innerText = data.data.associations.length;

        paginate("", 1, data, false);

        clearAssociations();
        data.data.associations.forEach((association: IAssociationType) => {
            buildAssociationElement(
                association.id,
                association.name,
                association.description,
                association.email
            )
        });
        const loader: HTMLElement|null = document.getElementById('associationsLoader');
        if (!loader) {
            console.error("Élément HTML pour le loader introuvable.");
            return;
        }

        loader.classList.add('hide');
    });
}


document.addEventListener("DOMContentLoaded", () => {

    // First load
    loadAllAssociations();

    // Gestion de la recherche
    const searchInput = document.getElementById('searchAssociations');
    if (searchInput) {
        let timeout: number|undefined = undefined
        searchInput.addEventListener('input', (e: Event) => {
            if (timeout !== undefined) {
                clearTimeout(timeout);
                timeout = undefined;
            }

            timeout = setTimeout(_ => {
                let searchTerm = (<HTMLInputElement>e.target)?.value;
                const searchTerm_replaced = searchTerm.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

                if (searchTerm !== searchTerm_replaced){
                    if (!e.target){
                        console.error("Élément HTML pour le champ de recherche introuvable.");
                        return;
                    }

                    (<HTMLInputElement>e.target).value = searchTerm_replaced;
                    return;
                }

                searchTerm.toLowerCase();

                if (searchTerm.length < 1) {
                    loadAllAssociations();
                    return;
                }

                search(searchTerm, 1);

                clearTimeout(timeout);
                timeout = undefined;
            }, 800);
        });
    }

    // Gestion du formulaire d'ajout d'association
    const addForm: HTMLElement|null = document.getElementById('addAssociationForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = (<HTMLInputElement>document.getElementById('associationName')).value;
            const email = (<HTMLInputElement>document.getElementById('associationEmail')).value;
            const description = (<HTMLInputElement>document.getElementById('associationDescription')).value;

            FetchService.post('/api/association', {
                    name: name,
                    email: email,
                    description: description,
                })
                .then(data => {
                    // Fermer la modale
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addAssociationModal'));
                    if (!modal) {
                        console.error('Instance de la modale d\'ajout introuvable.');
                        return;
                    }
                    modal.hide();

                    // Réinitialiser le formulaire
                    (<HTMLFormElement>addForm).reset();

                    buildAssociationElement(
                        data.association_id,
                        name,
                        description,
                        email
                    );

                    NotificationService.notify(new NotificationHTMLElement(true, data.message));
                }
            )
        });
    }

    // Bouton "Modifier" depuis la modale de visualisation
    const btnEditFromView: HTMLElement|null = document.getElementById('btnOpenEditFromView');
    if (!btnEditFromView) {
        console.error('Élément HTML pour le bouton de modification depuis la modale de visualisation introuvable.');
        return;
    }

    btnEditFromView.addEventListener('click', () => {
        const associationId = document.getElementById('btnOpenEditFromView')?.dataset.associationId;
        openEditModal(associationId);
    });

    // Gestion du formulaire de modification
    const editForm: HTMLElement|null = document.getElementById('editAssociationForm');
    if (!editForm) {
        console.error('Élément HTML pour le formulaire de modification introuvable.');
        return;
    }
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const associationId: any = (<HTMLInputElement>document.getElementById('editAssociationId'))?.value;
        const name: string = (<HTMLInputElement>document.getElementById('editAssociationName'))?.value;
        const email: string = (<HTMLInputElement>document.getElementById('editAssociationEmail'))?.value;
        const description: string = (<HTMLInputElement>document.getElementById('editAssociationDescription'))?.value;

        // Mettre à jour les données
        associationsData[associationId].name = name;
        associationsData[associationId].email = email;
        associationsData[associationId].description = description;

        // Mettre à jour le DOM
        const card = document.querySelector(`.association-card[data-id="${associationId}"]`);
        if (card) {
            (<HTMLInputElement>card.querySelector('.association-name')).textContent = name;
            (<HTMLInputElement>card.querySelector('.association-email')).textContent = email;
            (<HTMLInputElement>card.querySelector('.association-description')).textContent = description;
        }

        FetchService.patch(`/api/association/${associationId}`, {
            associationId: associationId,
            name: name,
            email: email,
            description: description,
        }).then(data => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
            if (!modal) {
                console.error('Instance de la modale de modification introuvable.');
                return;
            }
            modal.hide();

            NotificationService.notify(new NotificationHTMLElement(true, data.message));
        })
    });

    // Gestion du bouton de suppression
    const btnDelete: HTMLElement|null = document.getElementById('btnDeleteAssociation');
    if (!btnDelete) {
        console.error('Élément HTML pour le bouton de suppression introuvable.');
        return;
    }

    btnDelete.addEventListener('click', _ => {
        const associationId: any = (<HTMLInputElement>document.getElementById('editAssociationId'))?.value;
        const association = associationsData[associationId];

        if (confirm(`Êtes-vous sûr de vouloir supprimer l'association "${association.name}" ?`)) {
            // Supprimer du DOM
            const card: HTMLElement|null = document.querySelector(`.association-card[data-id="${associationId}"]`);
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                    // Mettre à jour le compteur
                    const statValue: HTMLElement|null = document.querySelector('.stat-value');
                    if (statValue) {
                        statValue.textContent = document.querySelectorAll('.association-card').length.toString();
                    }
                }, 300);
            }

            // Supprimer des données
            delete associationsData[associationId];

            FetchService.delete(`/api/association/${associationId}`, {
                associationId: associationId,
            }).then(data => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editAssociationModal'));
                if (!modal) {
                    console.error('Instance de la modale de modification introuvable.');
                    return;
                }
                modal.hide();

                NotificationService.notify(new NotificationHTMLElement(true, data.message));
            })
        }
    });
})
