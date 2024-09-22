function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    const user_id = window.localStorage.getItem('user_id');

    if (!user_id) {
        return;
    }

    const country = 'ES';
    const year = new Date().getFullYear();
    const apiBaseURL = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        eventClick: function(info) {
            handleEventClick(info.event);
        },
        dateClick: function(info) {
            handleDateClick(info.dateStr);
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetchEvents(fetchInfo, successCallback, failureCallback, apiBaseURL);
        },
        eventDrop: updateEvent,
        eventResize: updateEvent
    });

    calendar.render();

    function handleEventClick(event) {
        const isTask = event.extendedProps && event.extendedProps.user_id !== undefined;
        const isHoliday = event.extendedProps && event.extendedProps.isHoliday;

        const title = event.title;
        const description = event.extendedProps.description || "No hay descripción disponible.";
        const date = event.start.toLocaleDateString();
    
        let htmlContent = `
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Descripción:</strong> ${description}</p>
        `;
    
        if (isTask) {
            htmlContent += '<br><button id="delete-task" class="swal2-cancel swal2-styled" style="background-color: #d33;">Eliminar</button>';
        }
    
        Swal.fire({
            title: title,
            html: htmlContent,
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'Cerrar',
            didRender: () => {
                if (isTask) {
                    document.getElementById('delete-task').addEventListener('click', function() {
                        confirmDelete(event);
                    });
                }
            }
        });
    }

    function confirmDelete(event) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteEvent(event);
            }
        });
    }
    
    function deleteEvent(event) {
        fetch(`/calendario/${event.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: event.extendedProps.user_id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                event.remove();
                Swal.fire('Eliminado', 'La tarea ha sido eliminada', 'success');
            } else {
                Swal.fire('Error', 'No se pudo eliminar la tarea. Intenta de nuevo.', 'error');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudo eliminar la tarea. Intenta de nuevo.', 'error');
        });
    }

    function fetchEvents(fetchInfo, successCallback, failureCallback, apiBaseURL) {
        fetch(`/calendario?user_id=${user_id}`)
            .then(response => response.json())
            .then(events => {
                events.forEach(event => {
                    if (event.user_id) {
                        event.extendedProps = event.extendedProps || {};
                        event.extendedProps.user_id = event.user_id;
                    }
                });

                // Añadir festivos desde la API.
                fetch(apiBaseURL)
                    .then(response => response.json())
                    .then(data => {
                        data.forEach(holiday => {
                            events.push({
                                title: holiday.localName,
                                start: holiday.date,
                                allDay: true,
                                classNames: ['fc-holiday'],
                                extendedProps: {
                                    isHoliday: true
                                }
                            });
                        });
                        successCallback(events);
                    })
                    .catch(error => {
                        successCallback(events);
                    });
            })
            .catch(error => {
                failureCallback(error);
            });
    }

    function handleDateClick(dateStr) {
        Swal.fire({
            title: 'Añadir Tarea',
            html: `
                <input type="text" id="task-title" class="swal2-input" placeholder="Título de la tarea">
                <textarea id="task-desc" class="swal2-textarea" placeholder="Descripción"></textarea>
                <input type="time" id="task-time" class="swal2-input">
                <label for="all-day">Todo el día</label>
                <input type="checkbox" id="all-day">
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                const title = document.getElementById('task-title').value;
                const description = document.getElementById('task-desc').value;
                const time = document.getElementById('task-time').value;
                const allDay = document.getElementById('all-day').checked;

                if (!time && !allDay) {
                    Swal.showValidationMessage('Debe seleccionar una hora o marcar "Todo el día".');
                    return false;
                }

                return {
                    title: title,
                    description: description,
                    time: time,
                    allDay: allDay
                };
            }
        }).then(result => {
            if (result.isConfirmed) {
                const eventData = {
                    title: result.value.title,
                    start: dateStr + (result.value.allDay ? '' : `T${result.value.time}:00`),
                    allDay: result.value.allDay,
                    description: result.value.description,
                    user_id: user_id
                };
                addEvent(eventData);
            }
        });
    }

    function addEvent(eventData) {
        fetch('/calendario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                calendar.addEvent(data);
                Swal.fire('Guardado', 'La tarea se ha añadido al calendario', 'success');
            } else {
                Swal.fire('Error', 'No se pudo añadir la tarea. Intenta de nuevo.', 'error');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudo añadir la tarea. Intenta de nuevo.', 'error');
        });
    }

    function updateEvent(event) {
        const eventData = {
            id: event.id,
            title: event.title,
            start: event.start.toISOString(),
            end: event.end ? event.end.toISOString() : null,
            allDay: event.allDay,
            description: event.extendedProps.description,
            user_id: user_id
        };

        fetch('/calendario', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire('Actualizado', 'La tarea se ha actualizado', 'success');
        })
        .catch(error => {
            Swal.fire('Error', 'No se pudo actualizar la tarea. Intenta de nuevo.', 'error');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const calendarContainer = document.getElementById('calendar-container');
    if (calendarContainer) {
        initializeCalendar();
    }
});
