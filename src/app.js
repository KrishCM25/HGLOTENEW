import express from 'express';
import path from 'path';
import axios from 'axios';

const app = express();



// Datos estáticos (puedes cambiar esto para recibir el DNI desde el cliente)
const token = 'apis-token-11030.SCSv4kKYWlHpNtJT2xmm5h0Wd4NEHhOw';

// Ruta para consultar el DNI
app.get('/dni/:dni', async (req, res) => {
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
// app.use((req, res, next) => {
//     res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://vivehg.com");
//     console.log('Content-Security-Policy header set'); // Para depuración
//     next();
// });

// Ruta para mostrar el archivo lotehg.html
app.get('/lotehg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lotehg.html'));
});
app.get('/jamil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jamil.html'));
});
// Ruta para mostrar el archivo lotehg.html
// app.get('/lotehg', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'lotehg.html'));
// });

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use('/', express.static(path.join(__dirname, '/public')));


// Servir otro contenido en la ruta principal "/"
app.get('/', (req, res) => {
    res.send('Bienvenido a la página principal RuletaHG');
  });
  
// Ruta para obtener posts de WordPress
app.get('/api/posts', async (req, res) => {
    try {
        const response = await axios.get('https://vivehg.com/blog/wp-json/wp/v2/posts?per_page=5');
        const posts = response.data;

        // Procesar los datos antes de enviarlos al frontend
        const processedPosts = posts.map(post => ({
            title: post.title.rendered,
            excerpt: post.excerpt.rendered,
            link: post.link,
            image: post.featured_media ? `https://vivehg.com/blog/wp-json/wp/v2/media/${post.featured_media}` : null
        }));

        res.json(processedPosts);
    } catch (error) {
        console.error('Error al obtener los posts:', error.message);
        res.status(500).json({ message: `Error al obtener los posts ${error.message}` });
    }
});
// // Ruta para API
// app.get('/api', (req, res) => {
//     res.send('¡API está funcionando!');
// });


export default app;