const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // Para manejar variables de entorno

dotenv.config(); // Cargar variables de entorno

const app = express();
const port = 3000;
const secretKey = process.env.SECRET_KEY || '1018484336'; // Clave secreta para JWT
const adminKey = process.env.ADMIN_KEY || 'Emma1722'; // Clave de administrador

// Configuración de MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia esto según tu configuración
    database: 'lifequal_life'
});

// Conectar a MySQL
connection.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar solicitudes GET a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

// Rutas para pacientes
app.post('/pacientes', (req, res) => {
    const { nombre, apellido, edad, genero, tipoDocumento, numeroDocumento, telefono, direccion, rh, nombreAcompanante, telefonoAcompanante } = req.body;
    const query = `
        INSERT INTO pacientes (nombre, apellido, edad, genero, tipo_documento, numero_documento, telefono, direccion, rh, nombre_acompanante, telefono_acompanante)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  NOW())
    `;
    connection.query(query, [nombre, apellido, edad, genero, tipoDocumento, numeroDocumento, telefono, direccion, rh, nombreAcompanante, telefonoAcompanante], (err, results) => {
        if (err) {
            console.error('Error al agregar paciente:', err);
            res.status(500).send('Error al agregar paciente');
            return;
        }
        res.status(201).json({ id: results.insertId, nombre, apellido, edad, genero, tipoDocumento, numeroDocumento, telefono, direccion, rh, nombreAcompanante, telefonoAcompanante });
    });
});

app.get('/pacientes', (req, res) => {
    connection.query('SELECT * FROM pacientes', (err, results) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            res.status(500).send('Error al obtener pacientes');
            return;
        }
        res.json(results);
    });
});

app.get('/pacientes/:id', (req, res) => {
    const pacienteId = req.params.id;
    connection.query('SELECT * FROM pacientes WHERE id = ?', [pacienteId], (err, results) => {
        if (err) {
            console.error('Error al obtener detalles del paciente:', err);
            res.status(500).send('Error al obtener detalles del paciente');
            return;
        }
        res.json(results[0]);
    });
});

// Rutas para notas
app.post('/notas', (req, res) => {
    const { paciente_id, nota, saturacion, frecuenciaCardiaca, tensionArterial, frecuenciaRespiratoria } = req.body;
    const query = `
        INSERT INTO notas (paciente_id, contenido, saturacion, frecuencia_cardiaca, tension_arterial, frecuencia_respiratoria, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    connection.query(query, [paciente_id, nota, saturacion, frecuenciaCardiaca, tensionArterial, frecuenciaRespiratoria], (err, results) => {
        if (err) {
            console.error('Error al agregar nota:', err);
            res.status(500).send('Error al agregar nota');
            return;
        }
        res.status(201).json({
            id: results.insertId,
            paciente_id,
            contenido: nota,
            saturacion,
            frecuencia_cardiaca: frecuenciaCardiaca,
            tension_arterial: tensionArterial,
            frecuencia_respiratoria: frecuenciaRespiratoria,
            fecha_creacion: new Date()
        });
    });
});

app.get('/notas', (req, res) => {
    connection.query('SELECT * FROM notas', (err, results) => {
        if (err) {
            console.error('Error al obtener notas:', err);
            res.status(500).send('Error al obtener notas');
            return;
        }
        res.json(results);
    });
});

app.get('/notas/:pacienteId', (req, res) => {
    const pacienteId = req.params.pacienteId;
    connection.query('SELECT * FROM notas WHERE paciente_id = ?', [pacienteId], (err, results) => {
        if (err) {
            console.error('Error al obtener historial de notas:', err);
            res.status(500).send('Error al obtener historial de notas');
            return;
        }
        res.json(results);
    });
});

// Registro de usuario
app.post('/register', (req, res) => {
    const { name, lastname, id_number, username, password, adminKey } = req.body;

    if (adminKey !== adminKey) { // Verifica la clave de administrador
        return res.status(403).json({ success: false, message: 'Clave de administrador incorrecta.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al encriptar contraseña:', err);
            return res.status(500).json({ success: false, message: 'Error al encriptar contraseña.' });
        }

        const query = `
            INSERT INTO users (name, lastname, cedula, username, password)
            VALUES (?, ?, ?, ?, ?)
        `;
        connection.query(query, [name, lastname, cedula, username, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ success: false, message: 'Error al registrar usuario.' });
            }
            res.status(201).json({ success: true, message: 'Usuario registrado exitosamente.' });
        });
    });
});

// Inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener usuario.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ success: false, message: 'Error al comparar contraseñas.' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
            res.json({ success: true, token });
        });
    });
});

// Obtener todos los usuarios
app.get('/users', (req, res) => {
    connection.query('SELECT id, name, lastname, username FROM users', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).send('Error al obtener usuarios');
        }
        res.json(results);
    });
});

// Obtener un usuario por ID
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    connection.query('SELECT id, name, lastname, username FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).send('Error al obtener usuario');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json(results[0]);
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
