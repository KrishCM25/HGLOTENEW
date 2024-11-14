const app = express();

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
        res.status(500).json({ message: 'Error al obtener los posts' });
    }
});

// Middleware para permitir solo campinhouse.com en iframes
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://vivehg.com");
    next();
});

// Rutas para servir archivos estáticos
app.use('/', express.static(path.join(__dirname, '/public')));

// Ruta para mostrar el archivo jamil.html
app.get('/jamil', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jamil.html'));
});

// Servir otro contenido en la ruta principal "/"
app.get('/', (req, res) => {
    res.send('Bienvenido a la página principal RuletaHG');
});