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
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://vivehg.com");
    console.log('Content-Security-Policy header set'); // Para depuración
    next();
});

// Ruta para mostrar el archivo lotehg.html
app.get('/lotehg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lotehg.html'));
});
app.get('/jamil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jamil.html'));
});

// Ruta para validar el webhook
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'EAAhgbVzGu70BOZBtnbqrKhxR149BJpGZANxvFjpj6LPVZADIdbvZCDOgixPI9EYMz4bc6mLm0bA16mn3yT8m24EAXQMgowZBJp4soGuRE6t5S9EItnKiJ5TYPYxAez6TMN7CMllhxUNitR5WnA1L1yA8Xdj5Fg4VxAJ9eTLz5Q3sZB7FixUUQvNptc1e2ZA3SfT0ZAu91UokFb2EZCLRNexLeZAJR8c3RY9MRcZBlFG5qQ7'; // Define tu propio token

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verifica el token y responde con el desafío
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403); // Token inválido
    }
});

// Ruta para recibir eventos
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.sendStatus(200);
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

        // Formatea los datos antes de enviarlos al frontend
        const processedPosts = await Promise.all(
            posts.map(async (post) => {
                let image = null;

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
// // Ruta para API
// app.get('/api', (req, res) => {
//     res.send('¡API está funcionando!');
// });


export default app;