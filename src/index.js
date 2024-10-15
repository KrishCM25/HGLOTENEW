import fs from "fs";
import https from "https";
import { Server as WebSocketServer } from "socket.io";
import express from "express";
import Sockets from "./sockets";
import { connectDB } from "./db";
import { PORT } from "./config";
import app from "./app";


// Leer los archivos del certificado SSL
const privateKey = fs.readFileSync("/etc/letsencrypt/live/campinhouse.com/privkey.pem", "utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/campinhouse.com/fullchain.pem", "utf8");
const ca = fs.readFileSync("/etc/letsencrypt/live/campinhouse.com/chain.pem", "utf8");

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Configurar HTTPS en lugar de HTTP
const app = express();
connectDB();

const httpsServer = https.createServer(credentials, app);

const io = new WebSocketServer(httpsServer);

// Iniciar servidor HTTPS
httpsServer.listen(PORT, () => {
  console.log(`Servidor corriendo en HTTPS en el puerto ${PORT}`);
});

// Configurar los sockets
Sockets(io);