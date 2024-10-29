document.addEventListener('DOMContentLoaded', () => {
    const pacientesList = document.getElementById('pacientes-list');
    const pacienteInfo = document.getElementById('paciente-info');
    const pacienteDetails = document.getElementById('paciente-details');
    const historialNotasList = document.getElementById('historial-notas-list');
    const addNotaForm = document.getElementById('add-nota-form');
    let selectedPacienteId = null;

    // Cargar pacientes
    function loadPacientes() {
        fetch('/pacientes')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    pacientesList.innerHTML = data.map(paciente =>
                        `<li>
                            <a href="#" data-id="${paciente.id}" class="paciente-link">${paciente.nombre} ${paciente.apellido}</a>
                        </li>`
                    ).join('');
                    addPacienteClickListeners();
                } else {
                    console.error('Error: Datos de pacientes no son un arreglo.');
                }
            })
            .catch(error => console.error('Error al cargar pacientes:', error));
    }

    // Agregar manejadores de eventos a los enlaces de pacientes
    function addPacienteClickListeners() {
        const pacienteLinks = document.querySelectorAll('#pacientes-list .paciente-link');
        pacienteLinks.forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                selectedPacienteId = event.target.getAttribute('data-id');
                loadPacienteDetails(selectedPacienteId);
                loadHistorialNotas(selectedPacienteId);
            });
        });
    }

    // Cargar detalles del paciente
    function loadPacienteDetails(pacienteId) {
        fetch(`/pacientes/${pacienteId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                return response.json();
            })
            .then(data => {
                pacienteDetails.innerHTML = `
                    <p><strong>Nombre:</strong> ${data.nombre}</p>
                    <p><strong>Apellido:</strong> ${data.apellido}</p>
                    <p><strong>Edad:</strong> ${data.edad}</p>
                    <p><strong>Género:</strong> ${data.genero}</p>
                    <p><strong>Tipo de Documento:</strong> ${data.tipo_documento}</p>
                    <p><strong>Número de Documento:</strong> ${data.numero_documento}</p>
                    <p><strong>Teléfono:</strong> ${data.telefono}</p>
                    <p><strong>Dirección:</strong> ${data.direccion}</p>
                    <p><strong>RH:</strong> ${data.rh}</p>
                    <p><strong>Nombre del Acompañante:</strong> ${data.nombre_acompanante}</p>
                    <p><strong>Teléfono del Acompañante:</strong> ${data.telefono_acompanante}</p>
                `;
                pacienteInfo.style.display = 'block'; // Mostrar sección de información del paciente
            })
            .catch(error => console.error('Error al cargar detalles del paciente:', error));
    }

    // Cargar historial de notas del paciente seleccionado
    function loadHistorialNotas(pacienteId) {
        fetch(`/notas/${pacienteId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    historialNotasList.innerHTML = data.map(nota =>
                        `<li>${nota.fecha_creacion}: ${nota.contenido}</li>`
                    ).join('');
                } else {
                    console.error('Error: Datos de notas no son un arreglo.');
                }
            })
            .catch(error => console.error('Error al cargar historial de notas:', error));
    }

    // Manejar envío de formulario de nota
    addNotaForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!selectedPacienteId) {
            alert('Seleccione un paciente primero.');
            return;
        }

        const formData = new FormData(addNotaForm);
        const data = {
            paciente_id: selectedPacienteId,
            saturacion: formData.get('saturacion'),
            frecuencia_cardiaca: formData.get('frecuencia_cardiaca'),
            tension_arterial: formData.get('tension_arterial'),
            frecuencia_respiratoria: formData.get('frecuencia_respiratoria'),
            nota: formData.get('nota')
        };

        fetch('/notas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(() => {
            loadHistorialNotas(selectedPacienteId); // Recargar notas después de agregar una nueva
            addNotaForm.reset(); // Resetear el formulario de notas
        })
        .catch(error => console.error('Error al agregar nota:', error));
    });

    // Inicializar
    loadPacientes();
});
