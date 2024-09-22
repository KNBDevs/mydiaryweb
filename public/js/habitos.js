(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const habitosContainer = document.getElementById('habitos-container');

        function checkLoginAndLoadHabits() {
            const loggedIn = localStorage.getItem('loggedIn') === 'true';
            
            if (loggedIn) {
                cargarFormularioHabitos();
            } else {
                habitosContainer.innerHTML = `
                    <div style="text-align: center; color: red;">
                        <p>Haz login para ingresar a tus hábitos</p>
                    </div>
                `;
            }
        }

        // Verificar estado de login al cargar la página
        checkLoginAndLoadHabits();

        // Escuchar el evento de login y cargar los hábitos si el usuario inicia sesión
        document.addEventListener('userLoggedIn', function() {
            
            habitosContainer.innerHTML = `
                <form id="habit-form">
                    <label for="habit-date">Fecha:</label>
                    <input type="date" id="habit-date" name="habit-date">
                    <div class="habit-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Hábito</th>
                                    <th>Realizado</th>
                                </tr>
                            </thead>
                            <tbody id="habit-table-body">
                                <!-- Filas dinámicamente añadidas aquí -->
                            </tbody>
                        </table>
                    </div>
                    <button type="submit">Guardar Hábitos</button>
                </form>
                <button id="consultar-habitos">Consultar Hábitos</button>
                <button id="eliminar-habitos">Eliminar Hábitos</button>
            `;
            cargarFormularioHabitos(); 
        });
    });

    function cargarFormularioHabitos() {
        const habitDateInput = document.getElementById('habit-date');
        const habitTableBody = document.getElementById('habit-table-body');

        if (habitDateInput && habitTableBody) {
            habitDateInput.value = new Date().toISOString().substr(0, 10);
            habitTableBody.innerHTML = '';

            for (let i = 0; i < 20; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" name="habit[]" placeholder="Nuevo hábito ${i + 1}"></td>
                    <td><input type="checkbox" name="completed[]"></td>
                `;
                habitTableBody.appendChild(row);
            }
        }
    }
})();


// Agregar manejadores de eventos para el formulario de hábitos y los botones
document.getElementById('habit-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = this['habit-date'].value;
    const habits = Array.from(this.querySelectorAll('input[name="habit[]"]')).map(h => h.value);
    const completed = Array.from(this.querySelectorAll('input[name="completed[]"]')).map(c => c.checked);
    const user_id = localStorage.getItem('user_id');

    fetch('/habitos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `date=${date}&habits=${JSON.stringify(habits)}&completed=${JSON.stringify(completed)}&user_id=${user_id}`
    })
    .then(response => response.text())
    .then(data => {
        Swal.fire({
            title: 'Éxito',
            text: 'Hábitos guardados exitosamente.',
            icon: 'success'
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron guardar los hábitos. Por favor, inténtalo de nuevo más tarde.',
            icon: 'error'
        });
    });
});

document.getElementById('consultar-habitos').addEventListener('click', function() {
    const date = document.getElementById('habit-date').value;
    const user_id = localStorage.getItem('user_id');

    fetch(`/habitos?date=${encodeURIComponent(date)}&user_id=${encodeURIComponent(user_id)}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            const habitRows = document.querySelectorAll('#habit-form tbody tr');
            data.forEach((habit, index) => {
                if (habitRows[index]) {
                    habitRows[index].querySelector('input[name="habit[]"]').value = habit.habit;
                    habitRows[index].querySelector('input[name="completed[]"]').checked = habit.completed;
                }
            });
            Swal.fire({
                title: 'Consulta Exitosa',
                text: 'Hábitos cargados.',
                icon: 'success'
            });
        } else {
            Swal.fire({
                title: 'Sin Resultados',
                text: 'No se encontraron hábitos para la fecha seleccionada.',
                icon: 'info'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron consultar los hábitos. Por favor, inténtalo de nuevo más tarde.',
            icon: 'error'
        });
    });
});

document.getElementById('eliminar-habitos').addEventListener('click', function() {
    const date = document.getElementById('habit-date').value;
    const user_id = localStorage.getItem('user_id');

    fetch('/habitos', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `date=${encodeURIComponent(date)}&user_id=${encodeURIComponent(user_id)}`
    })
    .then(response => response.text())
    .then(data => {
        Swal.fire({
            title: 'Éxito',
            text: 'Hábitos eliminados exitosamente.',
            icon: 'success'
        });
        // Limpiar los campos de hábitos
        document.querySelectorAll('#habit-form tbody tr input[name="habit[]"]').forEach(input => input.value = '');
        document.querySelectorAll('#habit-form tbody tr input[name="completed[]"]').forEach(input => input.checked = false);
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron eliminar los hábitos. Por favor, inténtalo de nuevo más tarde.',
            icon: 'error'
        });
    });
});
