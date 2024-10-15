import express from 'express';
import path from 'path';

const app = express();

// Middleware para permitir solo campinhouse.com en iframes
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://campinhouse.com");
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