document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    const addPacienteForm = document.getElementById('add-paciente-form');
    const addNotaForm = document.getElementById('add-nota-form');
    const pacienteSelect = document.getElementById('paciente-select');
    const mensaje = document.getElementById('mensaje');

    // Formularios de Registro y Login
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerMessage = document.getElementById('register-message');
    const loginMessage = document.getElementById('login-message');

    // Función para cargar pacientes en el selector
    const loadPacientes = async () => {
        try {
            const response = await fetch('/pacientes');
            if (!response.ok) throw new Error('Error al cargar pacientes');
            const data = await response.json();
            pacienteSelect.innerHTML = '';
            data.forEach(paciente => {
                const option = document.createElement('option');
                option.value = paciente.id;
                option.textContent = `${paciente.nombre} ${paciente.apellido}`;
                pacienteSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
            mensaje.textContent = 'Error al cargar pacientes';
            mensaje.style.color = 'red';
        }
    };

    loadPacientes();

    // Validación de formularios
    const validatePacienteForm = () => {
        const nombre = addPacienteForm.querySelector('[name="nombre"]').value.trim();
        const apellido = addPacienteForm.querySelector('[name="apellido"]').value.trim();
        if (!nombre || !apellido) {
            mensaje.textContent = 'Nombre y Apellido son obligatorios';
            mensaje.style.color = 'red';
            return false;
        }
        return true;
    };

    const validateNotaForm = () => {
        const paciente_id = addNotaForm.querySelector('[name="paciente-select"]').value;
        const nota = addNotaForm.querySelector('[name="nota"]').value.trim();
        if (!paciente_id || !nota) {
            mensaje.textContent = 'Paciente y Nota son obligatorios';
            mensaje.style.color = 'red';
            return false;
        }
        return true;
    };

    const validateRegisterForm = () => {
        const name = registerForm.querySelector('[name="name"]').value.trim();
        const lastname = registerForm.querySelector('[name="lastname"]').value.trim();
        const id = registerForm.querySelector('[name="id"]').value.trim();
        const username = registerForm.querySelector('[name="username"]').value.trim();
        const password = registerForm.querySelector('[name="password"]').value.trim();
        const adminKey = registerForm.querySelector('[name="adminKey"]').value.trim();
        if (!name || !lastname || !id || !username || !password || !adminKey) {
            registerMessage.textContent = 'Todos los campos son obligatorios';
            registerMessage.style.color = 'red';
            return false;
        }
        return true;
    };

    const validateLoginForm = () => {
        const username = loginForm.querySelector('[name="username"]').value.trim();
        const password = loginForm.querySelector('[name="password"]').value.trim();
        if (!username || !password) {
            loginMessage.textContent = 'Nombre de usuario y contraseña son obligatorios';
            loginMessage.style.color = 'red';
            return false;
        }
        return true;
    };

    // Deshabilitar botón de envío
    const setFormState = (form, isSubmitting) => {
        form.querySelector('button[type="submit"]').disabled = isSubmitting;
    };

    // Manejar envío de formulario de paciente
    addPacienteForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!validatePacienteForm()) return;

        const formData = new FormData(addPacienteForm);
        const data = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            edad: formData.get('edad'),
            genero: formData.get('genero'),
            tipoDocumento: formData.get('tipo_documento'),
            numeroDocumento: formData.get('numero_documento'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion'),
            rh: formData.get('rh'),
            nombreAcompanante: formData.get('nombre_acompanante'),
            telefonoAcompanante: formData.get('telefono_acompanante')
        };

        setFormState(addPacienteForm, true);

        try {
            const response = await fetch('/pacientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al agregar paciente');

            mensaje.textContent = 'Paciente agregado exitosamente';
            mensaje.style.color = 'green';
            await loadPacientes();
            addPacienteForm.reset();
        } catch (error) {
            mensaje.textContent = `Error: ${error.message}`;
            mensaje.style.color = 'red';
        } finally {
            setFormState(addPacienteForm, false);
        }
    });

    // Manejar envío de formulario de nota
    addNotaForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!validateNotaForm()) return;

        const formData = new FormData(addNotaForm);
        const data = {
            paciente_id: formData.get('paciente-select'),
            saturacion: formData.get('saturacion'),
            frecuencia_cardiaca: formData.get('frecuencia_cardiaca'),
            tension_arterial: formData.get('tension_arterial'),
            frecuencia_respiratoria: formData.get('frecuencia_respiratoria'),
            nota: formData.get('nota')
        };

        setFormState(addNotaForm, true);

        try {
            const response = await fetch('/notas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al agregar nota');

            mensaje.textContent = 'Nota agregada exitosamente';
            mensaje.style.color = 'green';
            addNotaForm.reset();
            window.location.href = 'pacientes.html'; // Redirigir a pacientes.html
        } catch (error) {
            mensaje.textContent = `Error: ${error.message}`;
            mensaje.style.color = 'red';
        } finally {
            setFormState(addNotaForm, false);
        }
    });

    // Manejar envío de formulario de registro
    registerForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!validateRegisterForm()) return;

        const formData = new FormData(registerForm);
        const data = {
            name: formData.get('name'),
            lastname: formData.get('lastname'),
            id_number: formData.get('id_number'),
            username: formData.get('username'),
            password: formData.get('password'),
            adminKey: formData.get('adminKey')
        };

        setFormState(registerForm, true);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al registrar usuario');

            const result = await response.json();
            registerMessage.textContent = 'Registro exitoso';
            registerMessage.style.color = 'green';
            registerForm.reset();
        } catch (error) {
            registerMessage.textContent = `Error: ${error.message}`;
            registerMessage.style.color = 'red';
        } finally {
            setFormState(registerForm, false);
        }
    });

    // Manejar envío de formulario de login
    loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!validateLoginForm()) return;
    
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
    
        setFormState(loginForm, true);
    
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            console.log('Response status:', response.status); // Verifica el código de estado
    
            if (!response.ok) {
                throw new Error('Error al iniciar sesión');
            }
    
            const result = await response.json();
            console.log('Login result:', result); // Verifica el contenido del resultado
    
            // Guarda el token en el almacenamiento local
            localStorage.setItem('token', result.token);
            
            // Mensaje de éxito
            loginMessage.textContent = 'Inicio de sesión exitoso';
            loginMessage.style.color = 'green';
            loginForm.reset();
            
            // Redirigir a inicio.html
            console.log('Redirigiendo a inicio.html');
            window.location.href = 'inicio.html';
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            loginMessage.textContent = `Error: ${error.message}`;
            loginMessage.style.color = 'red';
        } finally {
            setFormState(loginForm, false);
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        // Recuperar la información del usuario del localStorage
        const user = localStorage.getItem('user');
        const userInfoElement = document.getElementById('user-info');
    
        if (user) {
            const userObj = JSON.parse(user);
            userInfoElement.textContent = `Usuario: ${userObj.name} ${userObj.lastname}`;
        } else {
            userInfoElement.textContent = 'Usuario no conectado';
        }
    });
});
