// Gestion dynamique du calendrier
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.events = []; // Stockage des événements
        this.selectedDate = null;
        this.currentEventId = null; // ID de l'événement en cours d'édition
        this.associations = []; // Liste des associations disponibles
        this.init();
    }

    init() {
        this.renderCalendar();
        this.attachEventListeners();
        this.attachInvitationListeners();
        this.loadAssociations(); // Charger les associations au démarrage
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
        this.renderCalendar();
    }

    // Mois suivant
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
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

        console.log('Événement ajouté:', event);
        console.log('Total événements:', this.events.length);

        return event;
    }

    // Supprimer un événement
    deleteEvent(eventId) {
        this.events = this.events.filter(e => e.id !== eventId);
        this.renderCalendar();
    }

    // Ouvrir la modale d'édition d'un événement
    openEditModal(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) {
            console.error('Événement non trouvé:', eventId);
            return;
        }

        // Stocker l'ID de l'événement en cours
        this.currentEventId = eventId;

        // Pré-remplir le formulaire d'édition
        document.getElementById('editEventId').value = event.id;
        document.getElementById('editEventTitle').value = event.title;
        document.getElementById('editEventStartDateTime').value = this.formatDateTimeLocal(new Date(event.startDateTime));
        document.getElementById('editEventEndDateTime').value = this.formatDateTimeLocal(new Date(event.endDateTime));
        document.getElementById('editEventDescription').value = event.description || '';

        // Charger les invitations
        this.loadInvitations(eventId);

        // Ouvrir la modale
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
        const editEventModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editEventModal'));

        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => {
                this.selectedDate = null;
                this.currentEventId = null;
                document.getElementById('eventForm').reset();
                // Vider la liste des invitations
                document.getElementById('createInvitationsList').innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Créez l\'événement pour ajouter des invitations</small></div>';
                eventModal.show();
            });
        }

        // Gérer la fermeture des modales
        document.getElementById('eventModal').addEventListener('hidden.bs.modal', () => {
            this.currentEventId = null;
            this.renderCalendar(); // Rafraîchir l'affichage
        });

        document.getElementById('editEventModal').addEventListener('hidden.bs.modal', () => {
            this.currentEventId = null;
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

                // Envoyer au backend
                try {
                    const response = await fetch('/event/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(eventData)
                    });

                    if (response.ok) {
                        const savedEvent = await response.json();
                        eventData.color = savedEvent.color;
                        eventData.id = savedEvent.event_id;
                        console.log('Événement créé avec succès:', savedEvent);

                        // Stocker l'ID de l'événement pour les invitations
                        this.currentEventId = savedEvent.event_id;

                        // Charger les invitations (vide pour un nouvel événement) - contexte 'create'
                        await this.loadInvitations(this.currentEventId, 'create');

                        // Ajouter localement
                        this.addEvent(eventData);

                        alert('Événement créé avec succès ! Vous pouvez maintenant ajouter des invitations.');
                    } else {
                        console.error('Erreur lors de la création de l\'événement');
                        alert('Erreur lors de la création de l\'événement');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    // En cas d'erreur backend, ajouter quand même localement pour la démo
                    this.addEvent(eventData);
                    eventModal.hide();
                    eventForm.reset();
                    alert('Événement créé localement (backend non disponible)');
                }
            });
        }

        // Bouton de suppression dans la modale d'édition
        const btnDeleteEvent = document.getElementById('btnDeleteEvent');
        if (btnDeleteEvent) {
            btnDeleteEvent.addEventListener('click', async () => {
                const eventId = parseInt(document.getElementById('editEventId').value);

                if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
                    try {
                        const response = await fetch(`/event/delete/${eventId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            console.log('Événement supprimé avec succès');

                            // Supprimer localement
                            this.deleteEvent(eventId);

                            // Fermer la modale
                            const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                            editModal.hide();

                            alert('Événement supprimé avec succès !');
                        } else {
                            alert('Erreur lors de la suppression de l\'événement');
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        // En cas d'erreur backend, supprimer quand même localement
                        this.deleteEvent(eventId);
                        const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                        editModal.hide();
                        alert('Événement supprimé localement');
                    }
                }
            });
        }

        // Formulaire de modification d'événement
        const editEventForm = document.getElementById('editEventForm');
        if (editEventForm) {
            editEventForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const eventId = parseInt(document.getElementById('editEventId').value);
                const eventData = {
                    title: document.getElementById('editEventTitle').value,
                    startDateTime: document.getElementById('editEventStartDateTime').value,
                    endDateTime: document.getElementById('editEventEndDateTime').value,
                    description: document.getElementById('editEventDescription').value
                };

                // Envoyer au backend
                try {
                    const response = await fetch(`/event/update/${eventId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(eventData)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('Événement modifié avec succès:', result);

                        // Mettre à jour localement
                        this.updateEvent(eventId, eventData);

                        // Fermer la modale
                        const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                        editModal.hide();

                        alert('Événement modifié avec succès !');
                    } else {
                        console.error('Erreur lors de la modification de l\'événement');
                        alert('Erreur lors de la modification de l\'événement');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    // En cas d'erreur backend, mettre à jour quand même localement
                    this.updateEvent(eventId, eventData);
                    const editModal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
                    editModal.hide();
                    alert('Événement modifié localement (backend non disponible)');
                }
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
                const dateTimeStr = this.formatDateTimeLocal(selectedDate);

                // Pré-remplir la date de début
                document.getElementById('eventStartDateTime').value = dateTimeStr;

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
        const editModal = new bootstrap.Modal(document.getElementById('editEventModal'));

        eventBadges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                // Si on clique sur le bouton supprimer, ne pas ouvrir la modale d'édition
                if (e.target.closest('.event-badge-delete')) {
                    return;
                }

                e.stopPropagation(); // Empêcher la propagation vers le jour
                const eventId = parseInt(badge.getAttribute('data-event-id'));

                // Ouvrir la modale d'édition
                this.openEditModal(eventId);
            });
        });

        // Attacher les événements de suppression
        const deleteButtons = document.querySelectorAll('.event-badge-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher la propagation vers le jour
                const eventId = parseInt(btn.getAttribute('data-event-id'));

                if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
                    // Supprimer localement
                    this.deleteEvent(eventId);

                    fetch(`/event/delete/${eventId}`, { method: 'DELETE' })
                        .then(res => {
                            if (res.status === 200) {
                                res.json()
                                    .then(data => console.log(data['message']));
                            }
                        })
                        .catch(err => {
                            console.error(err);
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

                if (!this.currentEventId) {
                    alert('Veuillez d\'abord créer l\'événement');
                    createAssociationSelect.value = '';
                    return;
                }

                await this.addInvitationByAssociationId(this.currentEventId, associationId, 'create');

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
                    alert('Veuillez saisir une adresse email');
                    return;
                }

                if (!this.validateEmail(email)) {
                    alert('Adresse email invalide');
                    return;
                }

                if (!this.currentEventId) {
                    alert('Veuillez d\'abord créer l\'événement');
                    return;
                }

                await this.addInvitationByEmail(this.currentEventId, email, 'create');
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

                if (!this.currentEventId) {
                    alert('Veuillez d\'abord créer l\'événement');
                    editAssociationSelect.value = '';
                    return;
                }

                await this.addInvitationByAssociationId(this.currentEventId, associationId, 'edit');

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
                    alert('Veuillez saisir une adresse email');
                    return;
                }

                if (!this.validateEmail(email)) {
                    alert('Adresse email invalide');
                    return;
                }

                if (!this.currentEventId) {
                    alert('Veuillez d\'abord créer l\'événement');
                    return;
                }

                await this.addInvitationByEmail(this.currentEventId, email, 'edit');
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
        try {
            const response = await fetch('/associations/available');
            const data = await response.json();

            if (data.success) {
                this.associations = data.associations;
                this.populateAssociationSelects();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des associations:', error);
        }
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

        if (!invitationsList) return;

        invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Chargement...</small></div>';

        try {
            const response = await fetch(`/event/${eventId}/invitations`);
            const data = await response.json();

            if (data.success) {
                this.renderInvitations(data.invitations, context);
            } else {
                invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Erreur de chargement</small></div>';
            }
        } catch (error) {
            console.error('Erreur lors du chargement des invitations:', error);
            invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Aucune invitation</small></div>';
        }
    }

    renderInvitations(invitations, context = 'edit') {
        const invitationsList = document.getElementById(context === 'create' ? 'createInvitationsList' : 'editInvitationsList');

        if (!invitationsList) return;

        if (!invitations || invitations.length === 0) {
            invitationsList.innerHTML = '<div class="text-center py-3" style="color: var(--saas-text-muted);"><small>Aucune invitation</small></div>';
            // Réinitialiser le sélecteur avec toutes les associations
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
                if (confirm('Supprimer cette invitation ?')) {
                    await this.deleteInvitation(invitationId, context);
                }
            });
        });
    }

    async addInvitationByAssociationId(eventId, associationId, context = 'edit') {
        try {
            const response = await fetch(`/event/${eventId}/invitation/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ associationId: parseInt(associationId) })
            });

            const data = await response.json();

            if (data.success) {
                // Recharger la liste des invitations
                await this.loadInvitations(eventId, context);
            } else {
                alert(data.message || 'Erreur lors de l\'ajout de l\'invitation');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'invitation:', error);
            alert('Erreur lors de l\'ajout de l\'invitation');
        }
    }

    async addInvitationByEmail(eventId, email, context = 'edit') {
        try {
            const response = await fetch(`/event/${eventId}/invitation/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                // Recharger les associations (une nouvelle a peut-être été créée)
                await this.loadAssociations();

                // Recharger la liste des invitations
                await this.loadInvitations(eventId, context);
            } else {
                alert(data.message || 'Erreur lors de l\'ajout de l\'invitation');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'invitation:', error);
            alert('Erreur lors de l\'ajout de l\'invitation');
        }
    }

    async deleteInvitation(invitationId, context = 'edit') {
        try {
            const response = await fetch(`/event/invitation/${invitationId}/delete`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                // Recharger la liste des invitations
                if (this.currentEventId) {
                    await this.loadInvitations(this.currentEventId, context);
                }
            } else {
                alert('Erreur lors de la suppression de l\'invitation');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'invitation:', error);
            alert('Erreur lors de la suppression de l\'invitation');
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    window.calendar = new Calendar();

    // Charger les événements depuis le backend
    // window.calendar.loadEvents();

    // Exemple : Ajouter quelques événements de test
    // Décommenter pour tester l'affichage des événements

    // window.calendar.addEvent({
    //     title: 'Réunion équipe',
    //     startDateTime: '2025-11-05T10:00',
    //     endDateTime: '2025-11-05T11:00',
    //     description: 'Réunion mensuelle de l\'équipe',
    //     color: '#8b5cf6'
    // });

    fetch('/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(response => {
        if (response.ok) {
            response.json().then((data) => {

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
    }).catch(error => {
        console.error(error);
    })

});

