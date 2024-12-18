import express from 'express';
import path from 'path';
import axios from 'axios';
import { config } from "dotenv";
const app = express();

config();

// Datos estáticos (puedes cambiar esto para recibir el DNI desde el cliente)
const tokenDNI = 'apis-token-11030.SCSv4kKYWlHpNtJT2xmm5h0Wd4NEHhOw';

// Ruta para consultar el DNI
app.get('/dni/:dni', async (req, res) => {
    const dni = req.params.dni;
    
    try {
        const response = await axios.get(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
            headers: {
                'Authorization': `Bearer ${tokenDNI}`,
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



// Ruta para mostrar el archivo lotehg.html
// app.get('/lotehg', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'lotehg.html'));
// });


// WEBHOOK WHATSAPP
const token = 'EAAhgbVzGu70BO7qUhhGYVZBrU2FibIU9HnkeIvOX3SyfNZBuGXDKJkCDKSKAIYvP1Ml5HrfMrBZBF3s9PAWzkGYcUIzAItyWx1zx2Lmw5rX0GKUeKbqtXmnZClXEKnd8Mh4ZAAYfJo70IhxG0MT2VMhZBPhGUuX1Xp1f5In2H22tXgPhNqJ5uY5eJHdUiBE6WMjgZDZD';
// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
    // Parse the request body from the POST
    let body = req.body;
  
    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));
  
    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id =
          req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
  
        let openai_data = JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Tu eres un asistente muy útil.",
            },
            {
              role: "user",
              content: msg_body,
            },
          ],
        });
  
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://api.openai.com/v1/chat/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              'Bearer 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',
          },
          data: openai_data,
        };
  
        await axios
          .request(config)
          .then((response) => {
            const response_data = response.data;
            console.log(JSON.stringify(response.data));
  
            axios({
              method: "POST", // Required, HTTP method, a string, e.g. POST, GET
              url:
                "https://graph.facebook.com/v12.0/" +
                phone_number_id +
                "/messages?access_token=" +
                token,
              data: {
                messaging_product: "whatsapp",
                to: from,
                text: { body: response_data.choices[0].message.content },
              },
              headers: { "Content-Type": "application/json" },
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  });
  
  // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
  app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = 'EAAhgbVzGu70BOZBtnbqrKhxR149BJpGZANxvFjpj6LPVZADIdbvZCDOgixPI9EYMz4bc6mLm0bA16mn3yT8m24EAXQMgowZBJp4soGuRE6t5S9EItnKiJ5TYPYxAez6TMN7CMllhxUNitR5WnA1L1yA8Xdj5Fg4VxAJ9eTLz5Q3sZB7FixUUQvNptc1e2ZA3SfT0ZAu91UokFb2EZCLRNexLeZAJR8c3RY9MRcZBlFG5qQ7';
  
    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
  
    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });



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