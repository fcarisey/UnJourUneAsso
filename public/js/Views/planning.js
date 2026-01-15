import App from '../App.js';

App.init(_ => {
    // Gestion dynamique du calendrier
    class Calendar {
        constructor() {
            this.currentDate = new Date();
            this.events = []; // Stockage des événements
            this.currentEventId = null; // ID de l'événement en cours d'édition
            this.associations = []; // Liste des associations disponibles
            this.isTransitioningToEdit = false; // Flag pour éviter la réinitialisation lors du passage création → édition
            this.init();
        }

        init() {
            void this.loadCurrentMonthEvents();
            this.renderCalendar();
            this.attachEventListeners();
            this.attachInvitationListeners();
            void this.loadAssociations(); // Charger les associations au démarrage
        }

        // Générer le calendrier pour le mois en cours
        renderCalendar() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            // Mettre à jour le titre du mois
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            const monthElement = document.querySelector('.saas-month');
            if (monthElement) {
                monthElement.textContent = `${monthNames[month]} ${year}`;
            }

            // Calculer les jours du mois
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const prevLastDay = new Date(year, month, 0);

            const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
            const lastDayDate = lastDay.getDate();
            const prevLastDayDate = prevLastDay.getDate();

            // Générer le HTML du calendrier
            let calendarHTML = '';
            let dayCounter = 1;

            for (let row = 0; row < 6; row++) {
                calendarHTML += '<tr>';

                for (let col = 0; col < 7; col++) {
                    const cellIndex = row * 7 + col;

                    if (cellIndex < firstDayIndex) {
                        // Jours du mois précédent
                        const prevMonthDay = prevLastDayDate - firstDayIndex + cellIndex + 1;
                        calendarHTML += `<td class="saas-day other-month" data-date="${year}-${month}-${prevMonthDay}">${prevMonthDay}</td>`;
                    } else if (dayCounter <= lastDayDate) {
                        // Jours du mois en cours
                        const isToday = this.isToday(year, month, dayCounter);
                        const hasEvent = this.hasEvent(year, month, dayCounter);
                        const todayClass = isToday ? 'today' : '';
                        const eventClass = hasEvent ? 'has-event' : '';

                        calendarHTML += `<td class="saas-day ${todayClass} ${eventClass}" data-date="${year}-${month + 1}-${dayCounter}">${dayCounter}`;

                        // Afficher les événements du jour
                        if (hasEvent) {
                            const dayEvents = this.getEventsForDay(year, month, dayCounter);
                            calendarHTML += '<div class="day-events">';
                            dayEvents.forEach(event => {
                                calendarHTML += `
                                <span class="event-badge" data-event-id="${event.id}" style="background: ${event.color ?? '#8b5cf6'}">
                                    <span class="event-badge-title">${event.title}</span>
                                    <button class="event-badge-delete" data-event-id="${event.id}" title="Supprimer">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </span>`;
                            });
                            calendarHTML += '</div>';
                        }

                        calendarHTML += '</td>';
                        dayCounter++;
                    } else {
                        // Jours du mois suivant
                        const nextMonthDay = cellIndex - firstDayIndex - lastDayDate + 1;
                        calendarHTML += `<td class="saas-day other-month" data-date="${year}-${month + 2}-${nextMonthDay}">${nextMonthDay}</td>`;
                    }
                }

                calendarHTML += '</tr>';

                // Arrêter si on a rempli tous les jours et qu'on est sur une ligne vide
                if (dayCounter > lastDayDate && row >= 4) break;
            }

            // Mettre à jour le tbody
            const calendarTbody = document.querySelector('.saas-calendar tbody');
            if (calendarTbody) {
                calendarTbody.innerHTML = calendarHTML;
            }

            // Réattacher les événements sur les jours
            this.attachDayListeners();
        }

        // Vérifier si c'est aujourd'hui
        isToday(year, month, day) {
            const today = new Date();
            return today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
        }

        // Vérifier si le jour a des événements
        hasEvent(year, month, day) {
            return this.events.some(event => {
                const eventDate = new Date(event.startDateTime);
                return eventDate.getFullYear() === year &&
                    eventDate.getMonth() === month &&
                    eventDate.getDate() === day;
            });
        }

        // Récupérer les événements d'un jour
        getEventsForDay(year, month, day) {
            return this.events.filter(event => {
                const eventDate = new Date(event.startDateTime);
                return eventDate.getFullYear() === year &&
                    eventDate.getMonth() === month &&
                    eventDate.getDate() === day;
            });
        }

        // Mois précédent
        previousMonth() {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);

            void this.loadCurrentMonthEvents();

            this.renderCalendar();
        }

        // Mois suivant
        nextMonth() {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);

            void this.loadCurrentMonthEvents();

            this.renderCalendar();
        }

        // Ajouter un événement
        addEvent(eventData) {
            const event = {
                id: eventData.id,
                title: eventData.title,
                startDateTime: eventData.startDateTime,
                endDateTime: eventData.endDateTime,
                description: eventData.description,
                color: eventData.color ?? '#8b5cf6'
            };

            this.events.push(event);
            this.renderCalendar();

            // console.log('Événement ajouté:', event);
            // console.log('Total événements:', this.events.length);

            return event;
        }

        // Supprimer un événement
        deleteEvent(eventId) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.renderCalendar();
        }

        clearEvent(){
            this.events = [];
        }

        // Ouvrir la modale d'édition d'un événement
        openEditModal(eventId) {
            const event = this.events.find(e => e.id === eventId);
            if (!event) {
                console.error('Événement non trouvé :', eventId);
                return;
            }

            // Stocker l'ID de l'événement en cours
            this.currentEventId = eventId;

            // Préremplir le formulaire d'édition
            document.getElementById('editEventId').value = event.id;
            document.getElementById('editEventTitle').value = event.title;
            document.getElementById('editEventStartDateTime').value = this.formatDateTimeLocal(new Date(event.startDateTime));
            document.getElementById('editEventEndDateTime').value = this.formatDateTimeLocal(new Date(event.endDateTime));
            document.getElementById('editEventDescription').value = event.description || '';

            // Charger les invitations
            void this.loadInvitations(eventId);

            // Ouvrir la modale
            const editModal = new bootstrap.Modal(document.getElementById('editEventModal'));
            editModal.show();
        }

        // Ouvrir la modale d'édition après création (charge l'événement puis ouvre la modale)
        async openEventForEdit(eventId) {
            // Trouver l'événement dans la liste locale
            const event = this.events.find(e => e.id === eventId);
            if (!event) {
                console.error('Événement non trouvé :', eventId);
                return;
            }

            // Stocker l'ID de l'événement en cours
            this.currentEventId = eventId;

            // S'assurer que les associations sont chargées
            if (this.associations.length === 0) {
                await this.loadAssociations();
            }

            // Pré-remplir le formulaire d'édition
            document.getElementById('editEventId').value = event.id;
            document.getElementById('editEventTitle').value = event.title;
            document.getElementById('editEventStartDateTime').value = this.formatDateTimeLocal(new Date(event.startDateTime));
            document.getElementById('editEventEndDateTime').value = this.formatDateTimeLocal(new Date(event.endDateTime));
            document.getElementById('editEventDescription').value = event.description || '';

            // Charger les invitations (contexte edit)
            await this.loadInvitations(eventId, 'edit');

            // Ouvrir la modale d'édition
            const editModal = new bootstrap.Modal(document.getElementById('editEventModal'));
            editModal.show();
        }

        // Mettre à jour un événement
        updateEvent(eventId, eventData) {
            const index = this.events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                this.events[index] = {
                    ...this.events[index],
                    title: eventData.title,
                    startDateTime: eventData.startDateTime,
                    endDateTime: eventData.endDateTime,
                    description: eventData.description
                };
                this.renderCalendar();
            }
        }

        // Attacher les écouteurs d'événements
        attachEventListeners() {
            // Boutons de navigation
            const prevBtn = document.querySelectorAll('.saas-btn-icon')[0];
            const nextBtn = document.querySelectorAll('.saas-btn-icon')[1];

            if (prevBtn) prevBtn.addEventListener('click', () => this.previousMonth());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());

            // Bouton nouvel événement
            const newEventBtn = document.querySelector('.saas-btn-primary');
            const eventModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('eventModal'));

            if (newEventBtn) {
                newEventBtn.addEventListener('click', () => {
                    this.selectedDate = null;
                    this.currentEventId = null;
                    document.getElementById('eventForm').reset();
                    eventModal.show();
                });
            }

            // Gérer la fermeture des modales
            document.getElementById('eventModal').addEventListener('hidden.bs.modal', () => {
                // Ne pas réinitialiser si on est en train de transiter vers la modale d'édition
                if (!this.isTransitioningToEdit) {
                    this.currentEventId = null;
                }
                this.renderCalendar(); // Rafraîchir l'affichage
            });

            document.getElementById('editEventModal').addEventListener('hidden.bs.modal', () => {
                this.currentEventId = null;
                this.isTransitioningToEdit = false; // Réinitialiser le flag
                this.renderCalendar(); // Rafraîchir l'affichage
            });

            // Formulaire d'événement
            const eventForm = document.getElementById('eventForm');
            if (eventForm) {
                eventForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const eventData = {
                        title: document.getElementById('eventTitle').value,
                        startDateTime: document.getElementById('eventStartDateTime').value,
                        endDateTime: document.getElementById('eventEndDateTime').value,
                        description: document.getElementById('eventDescription').value
                    };

                    void App.fetch.post('/api/event', eventData, data => {
                        if (!data.success){
                            console.error('Erreur lors de la création de l\'événement');
                            App.showToast('Erreur lors de la création de l\'événement', false);
                            return;
                        }

                        eventData.color = data.color;
                        eventData.id = data.event_id;
                        console.log('Événement créé avec succès :', data);

                        // Stocker l'ID de l'événement pour les invitations
                        this.currentEventId = data.event_id;

                        // Activer le flag pour éviter la réinitialisation de currentEventId
                        this.isTransitioningToEdit = true;

                        // Ajouter localement
                        this.addEvent(eventData);

                        // Fermer la modale de création
                        eventModal.hide();
                        eventForm.reset();

                        // Attendre que la modale soit complètement fermée avant d'ouvrir la suivante
                        setTimeout(async () => {
                            // Ouvrir la modale d'édition avec les invitations
                            await this.openEventForEdit(data.event_id);

                            // Afficher un message de succès
                            App.showToast('Événement créé avec succès ! Vous pouvez maintenant ajouter des invitations.');
                        }, 300);
                    })
                });
            }

            // Bouton de suppression dans la modale d'édition
            const btnDeleteEvent = document.getElementById('btnDeleteEvent');
            if (btnDeleteEvent) {
                btnDeleteEvent.addEventListener('click', async () => {
                    const eventId = document.getElementById('editEventId').value;

                    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
                        void App.fetch.delete(`/api/event/${eventId}`, {}, data => {
                            if (!data.success) {
                                console.error("Erreur lors de la suppression de l\'évènement");
                                App.showToast('Erreur lors de la suppression de l\'événement', false);
                                return;
                            }

                            console.log('Événement supprimé avec succès');

                            // Supprimer localement
                            this.deleteEvent(eventId);

                            // Fermer la modale
                            const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                            editModal.hide();

                            App.showToast('Événement supprimé avec succès !');
                        });
                    }
                });
            }

            // Formulaire de modification d'événement
            const editEventForm = document.getElementById('editEventForm');
            if (editEventForm) {
                editEventForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const eventId = document.getElementById('editEventId').value;
                    const eventData = {
                        title: document.getElementById('editEventTitle').value,
                        startDateTime: document.getElementById('editEventStartDateTime').value,
                        endDateTime: document.getElementById('editEventEndDateTime').value,
                        description: document.getElementById('editEventDescription').value
                    };

                    void App.fetch.put(`/api/event/${eventId}`, eventData, data => {
                        if (!data.success) {
                            console.error('Erreur lors de la modification de l\'événement');
                            App.showToast('Erreur lors de la modification de l\'événement', false);
                            return;
                        }

                        console.log('Événement modifié avec succès :', data);

                        // Mettre à jour localement
                        this.updateEvent(eventId, eventData);

                        // Fermer la modale
                        const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                        editModal.hide();

                        App.showToast('Événement modifié avec succès !');
                    })
                });
            }
        }

        // Attacher les événements de clic sur les jours
        attachDayListeners() {
            const days = document.querySelectorAll('.saas-day:not(.other-month)');
            const eventModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('eventModal'));

            days.forEach(day => {
                day.addEventListener('click', (e) => {
                    // Ne pas ouvrir la modale si on clique sur un événement ou le bouton supprimer
                    if (e.target.closest('.event-badge') || e.target.closest('.event-badge-delete')) {
                        return;
                    }

                    const dateStr = day.getAttribute('data-date');
                    const [year, month, dayNum] = dateStr.split('-');

                    // Créer la date au format ISO pour datetime-local
                    const selectedDate = new Date(year, month - 1, dayNum, 9, 0); // 9h par défaut
                    // Préremplir la date de début
                    document.getElementById('eventStartDateTime').value = this.formatDateTimeLocal(selectedDate);

                    // Pré-remplir la date de fin (1 heure plus tard)
                    const endDate = new Date(selectedDate);
                    endDate.setHours(endDate.getHours() + 1);
                    document.getElementById('eventEndDateTime').value = this.formatDateTimeLocal(endDate);

                    // Ouvrir la modale
                    eventModal.show();
                });
            });

            // Attacher les événements de clic sur les badges d'événements
            const eventBadges = document.querySelectorAll('.event-badge');

            eventBadges.forEach(badge => {
                badge.addEventListener('click', (e) => {
                    // Si on clique sur le bouton supprimer, ne pas ouvrir la modale d'édition
                    if (e.target.closest('.event-badge-delete')) {
                        return;
                    }

                    e.stopPropagation(); // Empêcher la propagation vers le jour
                    const eventId = badge.getAttribute('data-event-id');

                    // Ouvrir la modale d'édition
                    this.openEditModal(eventId);
                });
            });

            // Attacher les événements de suppression
            const deleteButtons = document.querySelectorAll('.event-badge-delete');
            deleteButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Empêcher la propagation vers le jour
                    const eventId = btn.getAttribute('data-event-id');

                    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {

                        void App.fetch.delete(`/api/event/${eventId}`, {}, data => {
                            if (!data.success) {
                                console.error(data.message);
                                App.showToast(data.message, false);
                                return;
                            }

                            this.deleteEvent(eventId);

                            console.log("Event deleted", data)
                            App.showToast("L'évènement a bien été supprimé.")
                        })
                    }
                });
            });
        }

        // Formater une date pour datetime-local input
        formatDateTimeLocal(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        // Gestion des invitations
        attachInvitationListeners() {
            // Modale de création - Sélecteur d'association
            const createAssociationSelect = document.getElementById('createAssociationSelect');
            if (createAssociationSelect) {
                createAssociationSelect.addEventListener('change', async (e) => {
                    const associationId = e.target.value;

                    if (!associationId) return;

                    // Accéder dynamiquement à this.currentEventId
                    const currentEventId = this.currentEventId;
                    console.log('createAssociationSelect - currentEventId:', currentEventId);

                    if (!currentEventId) {
                        App.showToast('Veuillez d\'abord créer l\'événement', false);
                        createAssociationSelect.value = '';
                        return;
                    }

                    await this.addInvitationByAssociationId(currentEventId, associationId, 'create');

                    // Réinitialiser le sélecteur
                    createAssociationSelect.value = '';
                });
            }

            // Modale de création - Email
            const btnCreateAddInvitation = document.getElementById('btnCreateAddInvitation');
            const createInvitationEmail = document.getElementById('createInvitationEmail');

            if (btnCreateAddInvitation) {
                btnCreateAddInvitation.addEventListener('click', async () => {
                    const email = createInvitationEmail.value.trim();

                    if (!email) {
                        App.showToast('Veuillez saisir une adresse email', false);
                        return;
                    }

                    if (!this.validateEmail(email)) {
                        App.showToast('Adresse email invalide', false);
                        return;
                    }

                    // Accéder dynamiquement à this.currentEventId
                    const currentEventId = this.currentEventId;
                    console.log('btnCreateAddInvitation - currentEventId:', currentEventId);

                    if (!currentEventId) {
                        App.showToast('Veuillez d\'abord créer l\'événement', false);
                        return;
                    }

                    await this.addInvitationByEmail(currentEventId, email, 'create');
                    createInvitationEmail.value = '';
                });

                // Ajouter avec la touche Entrée
                createInvitationEmail.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        btnCreateAddInvitation.click();
                    }
                });
            }

            // Modale d'édition - Sélecteur d'association
            const editAssociationSelect = document.getElementById('editAssociationSelect');
            if (editAssociationSelect) {
                editAssociationSelect.addEventListener('change', async (e) => {
                    const associationId = e.target.value;

                    if (!associationId) return;

                    // Accéder dynamiquement à this.currentEventId
                    const currentEventId = this.currentEventId;

                    if (!currentEventId) {
                        App.showToast('Veuillez d\'abord créer l\'événement', false);
                        editAssociationSelect.value = '';
                        return;
                    }

                    const invitationsList = document.getElementById('editInvitationsList');

                    invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Invitation en cours ...</small></div>';

                    await this.addInvitationByAssociationId(currentEventId, associationId, 'edit');

                    // Réinitialiser le sélecteur
                    editAssociationSelect.value = '';
                });
            }

            // Modale d'édition - Email
            const btnEditAddInvitation = document.getElementById('btnEditAddInvitation');
            const editInvitationEmail = document.getElementById('editInvitationEmail');

            if (btnEditAddInvitation) {
                btnEditAddInvitation.addEventListener('click', async () => {
                    const email = editInvitationEmail.value.trim();

                    if (!email) {
                        App.showToast('Veuillez saisir une adresse email', false);
                        return;
                    }

                    if (!this.validateEmail(email)) {
                        App.showToast('Adresse email invalide', false);
                        return;
                    }

                    // Accéder dynamiquement à this.currentEventId
                    const currentEventId = this.currentEventId;
                    console.log('btnEditAddInvitation - currentEventId:', currentEventId);

                    if (!currentEventId) {
                        App.showToast('Veuillez d\'abord créer l\'événement', false);
                        return;
                    }

                    await this.addInvitationByEmail(currentEventId, email, 'edit');
                    editInvitationEmail.value = '';
                });

                // Ajouter avec la touche Entrée
                editInvitationEmail.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        btnEditAddInvitation.click();
                    }
                });
            }
        }

        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        // Charger toutes les associations disponibles
        async loadAssociations() {
            void App.fetch.get('/api/associations', data => {
                if (!data.success) {
                    console.error(data.message);
                    App.showToast(data.message, false);
                    return;
                }

                this.associations = data.associations;
                this.populateAssociationSelects();
            })
        }

        // Peupler les sélecteurs d'associations
        populateAssociationSelects() {
            const createSelect = document.getElementById('createAssociationSelect');
            const editSelect = document.getElementById('editAssociationSelect');

            const populateSelect = (select) => {
                if (!select) return;

                // Garder l'option par défaut
                select.innerHTML = '<option value="">-- Choisir une association --</option>';

                // Ajouter les associations
                this.associations.forEach(assoc => {
                    const option = document.createElement('option');
                    option.value = assoc.id;
                    option.textContent = assoc.name;
                    select.appendChild(option);
                });
            };

            populateSelect(createSelect);
            populateSelect(editSelect);
        }

        // Filtrer les associations déjà invitées du sélecteur
        updateAssociationSelects(invitedAssociationIds, context = 'edit') {
            const select = document.getElementById(context === 'create' ? 'createAssociationSelect' : 'editAssociationSelect');

            if (!select) return;

            // Réinitialiser
            select.innerHTML = '<option value="">-- Choisir une association --</option>';

            // Ajouter seulement les associations non invitées
            this.associations
                .filter(assoc => !invitedAssociationIds.includes(assoc.id))
                .forEach(assoc => {
                    const option = document.createElement('option');
                    option.value = assoc.id;
                    option.textContent = assoc.name;
                    select.appendChild(option);
                });
        }

        async loadInvitations(eventId, context = 'edit') {
            const invitationsList = document.getElementById(context === 'create' ? 'createInvitationsList' : 'editInvitationsList');

            if (!invitationsList) {
                console.error('Liste des invitations non trouvée pour le contexte :', context);
                return;
            }

            invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Chargement ...</small></div>';

            void App.fetch.get(`/api/event/${eventId}/invitations`, data => {
                if (!data.success) {
                    invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Erreur de chargement</small></div>';

                    console.log(data.message);
                    App.showToast(data.message, false);
                    return;
                }

                // Rendre les invitations (peut être vide pour un nouvel événement)
                this.renderInvitations(data.invitations, context);
            })
        }

        renderInvitations(invitations, context = 'edit') {
            const invitationsList = document.getElementById(context === 'create' ? 'createInvitationsList' : 'editInvitationsList');

            if (!invitationsList) return;

            if (!invitations || invitations.length === 0) {
                invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Aucune invitation pour le moment</small></div>';
                // Réinitialiser le sélecteur avec toutes les associations disponibles
                this.updateAssociationSelects([], context);
                return;
            }

            // Récupérer les IDs des associations déjà invitées
            const invitedAssociationIds = invitations.map(inv => inv.association.id);

            invitationsList.innerHTML = invitations.map(inv => {
                const statusBadge = inv.etat === null
                    ? '<span style="font-size: 0.75rem; padding: 0.125rem 0.5rem; background: var(--saas-warning); color: var(--saas-bg); border-radius: 0.5rem; font-weight: 600;">En attente</span>'
                    : inv.etat
                        ? '<span style="font-size: 0.75rem; padding: 0.125rem 0.5rem; background: var(--saas-success); color: var(--saas-bg); border-radius: 0.5rem; font-weight: 600;">Acceptée</span>'
                        : '<span style="font-size: 0.75rem; padding: 0.125rem 0.5rem; background: var(--saas-danger); color: var(--saas-bg); border-radius: 0.5rem; font-weight: 600;">Refusée</span>';

                return `
                <div class="invitation-item d-flex justify-content-between align-items-center mb-2 p-2" style="background: var(--saas-surface); border-radius: 0.5rem; border: 1px solid var(--saas-border);">
                    <div class="flex-grow-1">
                        <div style="font-weight: 600; color: var(--saas-text);">${inv.association.name}</div>
                        ${statusBadge}
                    </div>
                    <button type="button" class="btn btn-sm btn-danger-invitation" data-invitation-id="${inv.id}" style="background: transparent; border: none; color: var(--saas-danger); padding: 0.25rem 0.5rem;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            `;
            }).join('');

            // Mettre à jour le sélecteur pour exclure les associations déjà invitées
            this.updateAssociationSelects(invitedAssociationIds, context);

            // Attacher les événements de suppression
            document.querySelectorAll('.btn-danger-invitation').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const invitationId = btn.getAttribute('data-invitation-id');

                    const delete_modal = new bootstrap.Modal(document.getElementById('deleteInvitationModal'));

                    delete_modal.show();
                    window.a = delete_modal;

                    const confirm_delete_invitation_button = delete_modal._element.querySelector('#confirmDeleteInvitation');

                    delete_modal._element.addEventListener('hidden.bs.modal', _ => {
                        const cloned_node = confirm_delete_invitation_button.cloneNode(true);
                        confirm_delete_invitation_button.parentNode.replaceChild(cloned_node, confirm_delete_invitation_button);
                    }, {
                        once: true,
                    })

                    confirm_delete_invitation_button.addEventListener('click', async _ =>{
                        await this.deleteInvitation(invitationId, context);
                        delete_modal.hide();
                    }, {
                        once: true,
                    })
                });
            });
        }

        async addInvitationByAssociationId(eventId, associationId, context = 'edit') {
            void App.fetch.post(`/api/invitation`, {
                event_id: eventId,
                association_id: associationId
            }, async data => {
                    if (!data.success) {
                        console.error(data.message);
                        App.showToast(data.message, false);
                        return;
                    }
                    // Recharger la liste des invitations
                    await this.loadInvitations(eventId, context);
                    App.showToast(data.message);
                }
            )
        }

        async addInvitationByEmail(eventId, email, context = 'edit') {
            void App.fetch.post(`/api/invitation`, {
                event_id: eventId,
                email: email
            }, async data => {
                if (!data.success) {
                    console.error(data.message);
                    App.showToast(data.message, false);
                    return;
                }

                // Recharger les associations (une nouvelle a peut-être été créée)
                await this.loadAssociations();

                // Recharger la liste des invitations
                await this.loadInvitations(eventId, context);
            })
        }

        async deleteInvitation(invitationId, context = 'edit') {
            void App.fetch.delete(`/api/invitation/${invitationId}`, {}, async data => {
                if (!data.success) {
                    console.error(data.message);
                    App.showToast(data.message, false);
                    return;
                }

                App.showToast(data.message);

                // Recharger la liste des invitations
                if (this.currentEventId) {
                    await this.loadInvitations(this.currentEventId, context);
                }
            })
        }

        async loadCurrentMonthEvents(){
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            const start_at = new Date(year, month, 1).toLocaleString().replaceAll('/', '-');
            const end_at = new Date(year, month+1, 0).toLocaleString().replaceAll('/', '-');

            // Refresh events list to current date range
            void App.fetch.get(`/api/events/range/${start_at}/${end_at}`, data => {
                if (!data.success) {
                    console.error(data.message);
                    App.showToast(data.message, false);
                    return;
                }

                this.clearEvent();

                Object(data.events).forEach(event => {
                    window.calendar.addEvent({
                        id: event.id,
                        title: event['name'],
                        startDateTime: event['start_at']['date'],
                        endDateTime: event['end_at']['date'],
                        description: event['description'],
                        color: event['color'] ?? '#10b981'
                    });
                })
            })
        }
    }

    window.calendar = new Calendar();
})
