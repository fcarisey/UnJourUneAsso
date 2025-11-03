// Gestion dynamique du calendrier
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.events = []; // Stockage des événements
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.renderCalendar();
        this.attachEventListeners();
    }

    // Générer le calendrier pour le mois en cours
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Mettre à jour le titre du mois
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        document.querySelector('.saas-month').textContent = `${monthNames[month]} ${year}`;

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
                                <span class="event-badge" data-event-id="${event.id}" style="background: ${event.color || '#8b5cf6'}">
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
        document.querySelector('.saas-calendar tbody').innerHTML = calendarHTML;

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
            color: eventData.color || '#8b5cf6'
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

    // Charger les événements depuis le backend
    async loadEvents() {
        try {
            const response = await fetch('/event/list');
            if (response.ok) {
                const events = await response.json();
                this.events = events;
                this.renderCalendar();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des événements:', error);
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
        const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));

        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => {
                this.selectedDate = null;
                document.getElementById('eventForm').reset();
                eventModal.show();
            });
        }

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
                        console.log('Événement créé avec succès:', savedEvent);

                        // Ajouter localement
                        this.addEvent(eventData);

                        // Fermer la modale et réinitialiser
                        eventModal.hide();
                        eventForm.reset();

                        alert('Événement créé avec succès !');
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
    }

    // Attacher les événements de clic sur les jours
    attachDayListeners() {
        const days = document.querySelectorAll('.saas-day:not(.other-month)');
        const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));

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

    fetch('/event/list', {
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
                        color: '#10b981'
                    });
                })
            })
        }
    }).catch(error => {
        console.error(error);
    })

});

