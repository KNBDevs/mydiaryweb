(function() {
    // Manejo del registro de usuarios
    document.getElementById('register-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'Registro',
                    text: 'Registro exitoso. Por favor, revisa tu email para verificar tu cuenta.',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'No se pudo completar el registro.',
                    icon: 'error'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo completar el registro. Por favor, inténtalo de nuevo más tarde.',
                icon: 'error'
            });
        });
    });

    // Manejo del login de usuarios
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = this.querySelector('input[name="email"]').value;
        const password = this.querySelector('input[name="password"]').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful.') {
                // Guardar el estado de login y el user_id en localStorage
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('user_id', data.user_id);

                // Emitir un evento personalizado para indicar que el usuario ha iniciado sesión
                const loginEvent = new CustomEvent('userLoggedIn', { detail: { user_id: data.user_id } });
                document.dispatchEvent(loginEvent);

                Swal.fire({
                    title: 'Login',
                    text: data.message,
                    icon: 'success'
                }).then(() => {
                    updateLoginState();
                    updateContentBasedOnLogin(); 
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo completar el login. Por favor, inténtalo de nuevo más tarde.',
                icon: 'error'
            });
        });
    });

    // Función para actualizar el estado de login en el header
    function updateLoginState() {
        const userForms = document.getElementById('user-forms');
        const loggedIn = localStorage.getItem('loggedIn') === 'true';

        if (loggedIn) {
            userForms.innerHTML = '<p><a href="#" id="logout-link">Desconectar</a></p>';

            document.getElementById('logout-link').addEventListener('click', function() {
                fetch('/logout', {
                    method: 'GET',
                })
                .then(() => {
                    localStorage.removeItem('loggedIn');
                    localStorage.removeItem('user_id');
                    Swal.fire({
                        title: 'Desconectado',
                        text: 'Has sido desconectado.',
                        icon: 'success'
                    }).then(() => {
                        showLoginRegisterForms();
                        updateContentBasedOnLogin(); 

                        window.location.reload();
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo completar la desconexión. Por favor, inténtalo de nuevo más tarde.',
                        icon: 'error'
                    });
                });
            });
        } else {
            showLoginRegisterForms();
        }
    }

    // Función para actualizar el contenido basado en el estado de login
    function updateContentBasedOnLogin() {
        const loggedIn = localStorage.getItem('loggedIn') === 'true';

        // Verificar si es la página del diario
        const diarioContainer = document.getElementById('diario-container');
        if (diarioContainer) {
            if (loggedIn) {
                diarioContainer.classList.remove('no-login');
                diarioContainer.classList.remove('login-warning');
                showDiaryForm();
            } else {
                diarioContainer.classList.add('no-login');
                diarioContainer.classList.add('login-warning');
                showLoginMessage(diarioContainer, "Haz login para ingresar a tu diario");
            }
        }

        // Verificar si es la página de hábitos
        const habitosContainer = document.getElementById('habitos-container');
        if (habitosContainer) {
            if (loggedIn) {
                habitosContainer.classList.remove('no-login');
                habitosContainer.classList.remove('login-warning');
                cargarFormularioHabitos(); 
            } else {
                habitosContainer.classList.add('no-login');
                habitosContainer.classList.add('login-warning');
                showLoginMessage(habitosContainer, "Haz login para ingresar a tus hábitos");
            }
        }

        // Verificar si es la página de calendario
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) {
            if (loggedIn) {
                calendarContainer.classList.remove('no-login');
                calendarContainer.classList.remove('login-warning');
                calendarContainer.innerHTML = '<div id="calendar"></div>';
                initializeCalendar(); 
            } else {
                calendarContainer.classList.add('no-login');
                calendarContainer.classList.add('login-warning');
                showLoginMessage(calendarContainer, "Haz login para ingresar a tu calendario");
            }
        }

        // Verificar si es la página de objetivos
        const objetivosContainer = document.getElementById('objetivos-container');
        if (objetivosContainer) {
            if (loggedIn) {
                objetivosContainer.classList.remove('no-login');
                objetivosContainer.classList.remove('login-warning');
                cargarFormularioObjetivos();
            } else {
                objetivosContainer.classList.add('no-login');
                objetivosContainer.classList.add('login-warning');
                showLoginMessage(objetivosContainer, "Haz login para ingresar a tus objetivos");
            }
        }
    }

    // Código común para el documento cargado
    document.addEventListener('DOMContentLoaded', function() {
        updateLoginState();
        updateContentBasedOnLogin(); 

        // Manejo del menú hamburguesa
        const burgerMenu = document.getElementById('burger-menu');
        const navLinks = document.querySelector('header nav ul');

        if (burgerMenu) {
            burgerMenu.addEventListener('click', function() {
                navLinks.classList.toggle('show');
                burgerMenu.classList.toggle('active');
            });
        }

        const toggleLogin = document.getElementById('toggle-login');
        const toggleRegister = document.getElementById('toggle-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (toggleLogin && toggleRegister) {
            toggleLogin.addEventListener('click', function() {
                loginForm.style.display = 'flex';
                registerForm.style.display = 'none';
                toggleLogin.style.display = 'none';
                toggleRegister.style.display = 'block';
            });

            toggleRegister.addEventListener('click', function() {
                registerForm.style.display = 'flex';
                loginForm.style.display = 'none';
                toggleRegister.style.display = 'none';
                toggleLogin.style.display = 'block';
            });
        }

        // Escuchar el evento personalizado para cargar el contenido automáticamente al iniciar sesión
        document.addEventListener('userLoggedIn', function() {
            updateContentBasedOnLogin();
        });
    });

    // Función para mostrar los formularios de login/registro
    function showLoginRegisterForms() {
        const userForms = document.getElementById('user-forms');
        userForms.innerHTML = `
            <form id="login-form">
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <button type="submit">Login</button>
            </form>
            <p id="toggle-register">¿No tienes cuenta? <a href="#">Regístrate aquí</a></p>
            <form id="register-form" style="display:none;">
                <input type="text" name="name" placeholder="Nombre" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Contraseña" required>
                <button type="submit">Registrar</button>
            </form>
            <p id="toggle-login" style="display:none;">¿Ya estás registrado? <a href="#">Haz login</a></p>
        `;

        const toggleLogin = document.getElementById('toggle-login');
        const toggleRegister = document.getElementById('toggle-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        toggleLogin.addEventListener('click', function() {
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
            toggleLogin.style.display = 'none';
            toggleRegister.style.display = 'block';
        });

        toggleRegister.addEventListener('click', function() {
            registerForm.style.display = 'flex';
            loginForm.style.display = 'none';
            toggleRegister.style.display = 'none';
            toggleLogin.style.display = 'block';
        });

        // Reatachar eventos de login y registro
        document.getElementById('register-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const password = this.querySelector('input[name="password"]').value;

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Registro',
                        text: 'Registro exitoso. Por favor, revisa tu email para verificar tu cuenta.',
                        icon: 'success'
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'No se pudo completar el registro.',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo completar el registro. Por favor, inténtalo de nuevo más tarde.',
                    icon: 'error'
                });
            });
        });

        document.getElementById('login-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const email = this.querySelector('input[name="email"]').value;
            const password = this.querySelector('input[name="password"]').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Login successful.') {
                    // Guardar el estado de login y el user_id en localStorage
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('user_id', data.user_id);

                    Swal.fire({
                        title: 'Login',
                        text: data.message,
                        icon: 'success'
                    }).then(() => {
                        updateLoginState(); 
                        updateContentBasedOnLogin(); 

                        // Emitir un evento personalizado para cargar el contenido
                        const loginEvent = new CustomEvent('userLoggedIn', { detail: { user_id: data.user_id } });
                        document.dispatchEvent(loginEvent);
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo completar el login. Por favor, inténtalo de nuevo más tarde.',
                    icon: 'error'
                });
            });
        });
    }

    // Función para cargar el formulario de hábitos si el usuario está logueado
    function cargarFormularioHabitos() {

    }

    // Función para cargar el formulario de objetivos si el usuario está logueado
    function cargarFormularioObjetivos() {

    }

    // Función para mostrar un mensaje de login en un contenedor específico
    function showLoginMessage(container, message) {
        container.innerHTML = '';

        const messageContainer = document.createElement('div');
        messageContainer.classList.add('login-message');
        messageContainer.textContent = message;
        container.appendChild(messageContainer);
    }

    // Funciones para el Diario (ejemplo en `diario.html`)
    function showDiaryForm() {
        const diarioContainer = document.getElementById('diario-container');
        diarioContainer.innerHTML = '';

        // Crear y agregar el formulario de entrada del diario y los botones
        diarioContainer.innerHTML = `
            <form id="diary-form">
                <label for="diary-date">Fecha:</label>
                <input type="date" id="diary-date" name="diary-date" value="${new Date().toISOString().substr(0, 10)}">
                <label for="diary-content">Escribe tu diario:</label>
                <textarea id="diary-content" name="diary-content"></textarea>
                <button type="submit">Guardar</button>
            </form>
            <button id="consultar">Consultar</button>
            <button id="eliminar">Eliminar</button>
        `;

        // Reatachar eventos al formulario y botones
        document.getElementById('diary-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const date = document.getElementById('diary-date').value;
            const content = document.getElementById('diary-content').value;
            const user_id = localStorage.getItem('user_id');

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
                document.getElementById('diary-form').reset();
                document.getElementById('diary-date').value = new Date().toISOString().substr(0, 10);
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

        document.getElementById('consultar').addEventListener('click', function() {
            const date = document.getElementById('diary-date').value;
            const user_id = localStorage.getItem('user_id');

            fetch(`/diario?date=${encodeURIComponent(date)}&user_id=${encodeURIComponent(user_id)}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    document.getElementById('diary-content').value = data[0].content;
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
                    document.getElementById('diary-content').value = '';
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

        document.getElementById('eliminar').addEventListener('click', function() {
            const date = document.getElementById('diary-date').value;
            const user_id = localStorage.getItem('user_id');

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
                document.getElementById('diary-content').value = '';
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

})();
