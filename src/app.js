import express from "express";
import path from "path";

// Crear una instancia de Express
const app = express();

// Middleware para servir archivos estáticos (si tienes una carpeta 'public')
app.use(express.static(path.join(__dirname, "/public")));

// Middleware para redirigir HTTP a HTTPS (si usas HTTP y HTTPS)
app.use((req, res, next) => {
  if (req.secure) {
    // La conexión es HTTPS, continúa
    return next();
  }
  // Redirigir a HTTPS si la solicitud es HTTP
  res.redirect(`https://${req.headers.host}${req.url}`);
});

// Otras rutas o middlewares (si tienes alguna API o rutas adicionales)
app.get('/api', (req, res) => {
  res.send("API está funcionando");
});

export default app;