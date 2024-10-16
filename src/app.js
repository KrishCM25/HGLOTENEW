import express from 'express';
import path from 'path';
import axios from 'axios';

const app = express();



// Datos estáticos (puedes cambiar esto para recibir el DNI desde el cliente)
const token = 'apis-token-11030.SCSv4kKYWlHpNtJT2xmm5h0Wd4NEHhOw';

// Ruta para consultar el DNI
app.get('/consulta-dni/:dni', async (req, res) => {
    const dni = req.params.dni;
    
    try {
        const response = await axios.get(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Referer': 'https://apis.net.pe/consulta-dni-api'
            }
        });
        
        // Enviar la respuesta al cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error al consultar el DNI:', error);
        res.status(500).json({ message: 'Error al consultar el DNI' });
    }
});



// Middleware para permitir solo campinhouse.com en iframes
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://vivehg.com");
    console.log('Content-Security-Policy header set'); // Para depuración
    next();
});

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '/public')));

// Middleware para redirigir HTTP a HTTPS (solo si no está usando HTTPS)
app.use((req, res, next) => {
    if (!req.secure) {
        // Redirigir a HTTPS
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Ruta para manejar GET /
app.get('/', (req, res) => {
    res.send('¡Bienvenido a CampinHouse!');
});

// Ruta para API
app.get('/api', (req, res) => {
    res.send('¡API está funcionando!');
});

export default app;