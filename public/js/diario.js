document.addEventListener('DOMContentLoaded', function() {
    const user_id = localStorage.getItem('user_id');
    const diaryForm = document.getElementById('diary-form');
    const diaryContent = document.getElementById('diary-content');
    const consultarBtn = document.getElementById('consultar');
    const eliminarBtn = document.getElementById('eliminar');
    const messageContainer = document.createElement('div');
    messageContainer.style.color = 'red';
    messageContainer.style.marginTop = '20px';

    if (!user_id) {
        // Si no hay usuario logueado, mostrar mensaje y ocultar el formulario y botones
        messageContainer.textContent = "Haz login para ingresar a tu diario";
        diaryForm.replaceWith(messageContainer);
        consultarBtn.style.display = 'none';
        eliminarBtn.style.display = 'none';
    } else {
        // Establecer la fecha actual en el campo de fecha automáticamente
        const today = new Date().toISOString().substr(0, 10);
        document.getElementById('diary-date').value = today;

        // Lógica de guardado
        diaryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const date = document.getElementById('diary-date').value;
            const content = diaryContent.value;

            fetch('/diario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `date=${encodeURIComponent(date)}&content=${encodeURIComponent(content)}&user_id=${encodeURIComponent(user_id)}`
            })
            .then(response => response.text())
            .then(data => {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Entrada del diario guardada con éxito.',
                    icon: 'success'
                });
                diaryForm.reset();
                document.getElementById('diary-date').value = today;
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar la entrada del diario. Por favor, inténtalo de nuevo más tarde.',
                    icon: 'error'
                });
            });
        });

        // Lógica para consultar el diario por fecha
        consultarBtn.addEventListener('click', function() {
            const date = document.getElementById('diary-date').value;

            fetch(`/diario?date=${encodeURIComponent(date)}&user_id=${encodeURIComponent(user_id)}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    diaryContent.value = data[0].content;
                    Swal.fire({
                        title: 'Consulta exitosa',
                        text: 'Entrada del diario cargada.',
                        icon: 'success'
                    });
                } else {
                    Swal.fire({
                        title: 'Sin resultados',
                        text: 'No se encontraron entradas para la fecha seleccionada.',
                        icon: 'info'
                    });
                    diaryContent.value = '';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo consultar la entrada del diario. Por favor, inténtalo de nuevo más tarde.',
                    icon: 'error'
                });
            });
        });

        // Lógica para eliminar entradas del diario
        eliminarBtn.addEventListener('click', function() {
            const date = document.getElementById('diary-date').value;

            fetch('/diario', {
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
                    text: 'Entrada del diario eliminada con éxito.',
                    icon: 'success'
                });
                diaryContent.value = '';
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la entrada del diario. Por favor, inténtalo de nuevo más tarde.',
                    icon: 'error'
                });
            });
        });
    }
});
