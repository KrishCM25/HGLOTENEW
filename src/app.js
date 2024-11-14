import express from 'express';
import path from 'path';
import axios from 'axios';
import cors from 'cors'; // Importar CORS

const app = express();

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Middleware para permitir solo campinhouse.com en iframes
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://vivehg.com");
    console.log('Content-Security-Policy header set'); // Para depuración
    next();
});

// Ruta para obtener posts de WordPress
app.get('/api/posts', async (req, res) => {
    try {
        const response = await axios.get('https://vivehg.com/blog/wp-json/wp/v2/posts?per_page=5');
        const posts = response.data;

        // Formatea los datos antes de enviarlos al frontend
        const processedPosts = await Promise.all(
            posts.map(async (post) => {
                let image = null;

                // Obtener la imagen destacada, si existe
                if (post.featured_media) {
                    try {
                        const mediaResponse = await axios.get(`https://vivehg.com/blog/wp-json/wp/v2/media/${post.featured_media}`);
                        image = mediaResponse.data.media_details.sizes.medium?.source_url || mediaResponse.data.source_url;
                    } catch (error) {
                        console.error(`Error obteniendo imagen destacada para el post ${post.id}: ${error.message}`);
                    }
                }

                return {
                    title: post.title.rendered,
                    excerpt: post.excerpt.rendered,
                    link: post.link,
                    image,
                };
            })
        );

        res.json(processedPosts);
    } catch (error) {
        console.error('Error al obtener los posts:', error.message);
        res.status(500).json({ message: 'Error al obtener los posts' });
    }
});

// Ruta para mostrar el archivo jamil.html
app.get('/jamil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jamil.html'));
});

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use('/', express.static(path.join(__dirname, '/public')));

// Servir otro contenido en la ruta principal "/"
app.get('/', (req, res) => {
    res.send('Bienvenido a la página principal RuletaHG');
});

export default app;