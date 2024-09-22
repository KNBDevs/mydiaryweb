document.addEventListener('DOMContentLoaded', function () {
    // Verificar si el usuario está logueado
    const loggedIn = localStorage.getItem('loggedIn') === 'true';

    if (!loggedIn) {
        document.getElementById('login-message').style.display = 'block';
    } else {
        document.getElementById('objetivo-form-container').style.display = 'block';
        document.getElementById('objetivos-list-container').style.display = 'block';
    }

    // Evento para guardar objetivo
    document.getElementById('objetivo-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const objetivo = this['objetivo'].value;
        const deadline = this['deadline'].value;
        const user_id = localStorage.getItem('user_id');

        fetch('/objetivos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `objetivo=${encodeURIComponent(objetivo)}&deadline=${encodeURIComponent(deadline)}&user_id=${encodeURIComponent(user_id)}`
        })
            .then(response => response.text())
            .then(data => {
                alert('Objetivo guardado con éxito');
                consultarObjetivos();
            })
            .catch(error => console.error('Error:', error));
    });

    // Evento para consultar objetivos
    document.getElementById('consultar-objetivos').addEventListener('click', consultarObjetivos);

    // Evento para eliminar objetivo
    document.getElementById('eliminar-objetivos').addEventListener('click', function () {
        const selectedRow = document.querySelector('#objetivos-table tbody tr.selected');
        if (selectedRow) {
            const objetivoId = selectedRow.dataset.id;
            if (confirm('¿Estás seguro de que deseas eliminar este objetivo?')) {
                eliminarObjetivo(objetivoId);
            }
        } else {
            alert('Por favor, selecciona un objetivo para eliminar.');
        }
    });

    // Función para consultar objetivos
    function consultarObjetivos() {
        const user_id = localStorage.getItem('user_id');
        fetch(`/objetivos?user_id=${encodeURIComponent(user_id)}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#objetivos-table tbody');
                tbody.innerHTML = '';

                data.forEach(objetivo => {
                    const tr = document.createElement('tr');
                    tr.dataset.id = objetivo.id;
                    tr.innerHTML = `
                        <td>${objetivo.objetivo}</td>
                        <td>${objetivo.deadline}</td>
                    `;
                    tr.addEventListener('click', function () {
                        document.querySelectorAll('#objetivos-table tbody tr').forEach(row => row.classList.remove('selected'));
                        tr.classList.add('selected');
                        document.getElementById('eliminar-objetivos').disabled = false;
                    });
                    tbody.appendChild(tr);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para eliminar objetivo
    function eliminarObjetivo(objetivoId) {
        fetch(`/objetivos/${encodeURIComponent(objetivoId)}`, {
            method: 'DELETE'
        })
            .then(response => response.text())
            .then(data => {
                alert('Objetivo eliminado con éxito');
                consultarObjetivos();
            })
            .catch(error => console.error('Error:', error));
    }
});
