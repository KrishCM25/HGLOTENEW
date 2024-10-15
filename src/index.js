import fs from 'fs';
import https from 'https';
import http from 'http';
import { Server as WebSocketServer } from 'socket.io';
import Sockets from './sockets';
import { connectDB } from './db';
import { PORT } from './config';
import app from './app';

// Leer los archivos del certificado SSL
const privateKey = fs.readFileSync("/etc/letsencrypt/live/campinhouse.com/privkey.pem", "utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/campinhouse.com/fullchain.pem", "utf8");
const ca = fs.readFileSync("/etc/letsencrypt/live/campinhouse.com/chain.pem", "utf8");

const credentials = { key: privateKey, cert: certificate, ca: ca };

connectDB();

// Crear servidor HTTPS
const httpsServer = https.createServer(credentials, app);
const io = new WebSocketServer(httpsServer);

// Iniciar servidor HTTPS
httpsServer.listen(PORT, () => {
    console.log(`Servidor corriendo en HTTPS en el puerto ${PORT}`);
});

// Configurar los sockets
Sockets(io);

// Crear servidor HTTP para redirigir a HTTPS
const httpServer = http.createServer((req, res) => {
  const host = req.headers.host;
  console.log(`Host recibido: ${host}`);
  
  if (host === '52.200.182.126') {
      res.writeHead(301, { "Location": `https://campinhouse.com${req.url}` });
      console.log('Redirigiendo a https://campinhouse.com');
      return res.end();
  }

  res.writeHead(301, { "Location": `https://${host}${req.url}` });
  console.log(`Redirigiendo a https://${host}${req.url}`);
  res.end();
});

// Escucha en el puerto 80 para HTTP
httpServer.listen(80, () => {
    console.log('Servidor HTTP escuchando en el puerto 80 y redirigiendo a HTTPS');
});