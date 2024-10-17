import Note from "./models/Note";
import axios from 'axios';

export default (io) => {
  io.on("connection", (socket) => {
    // console.log(socket.handshake.url);
    console.log("nuevo socket connectado:", socket.id);

    // Send all messages to the client
    const emitNotes = async () => {
      const notes = await Note.find();
      io.emit("server:loadnotes", notes);
    };
    emitNotes();

    socket.on("client:newnote", async (data) => {
      try {
        const token = 'apis-token-11030.SCSv4kKYWlHpNtJT2xmm5h0Wd4NEHhOw';
        // Consulta el DNI usando la API antes de crear la nota
        const dniResponse = await axios.get(`https://api.apis.net.pe/v2/reniec/dni?numero=${data.dni}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Usar el token que configuraste
            Referer: 'https://apis.net.pe/consulta-dni-api'
          }
        });
    
        // Agregar los datos de la consulta a la nota
        const noteData = {
          dni: data.dni,
          mail: data.mail,
          lote: data.lote,
          dniInfo: dniResponse.data // Agregar el resultado de la consulta del DNI
        };
    
        // Verificar si ya existe una nota con el mismo valor de "lote"
        const existingNote = await Note.findOne({ lote: data.lote });
        if (existingNote) {
          socket.emit("server:error", { message: "Ya existe una nota con este lote.", error: "duplicate_lote" });
          return;
        }
    
        // Si no existe una nota con el mismo lote, se crea una nueva
        const newNote = new Note(noteData); // Crear la nota con la información del DNI
        const savedNote = await newNote.save();
        io.emit("server:newnote", savedNote); // Emitir la nota nueva a todos los clientes conectados
      } catch (error) {
        console.error("Error al agregar una nueva nota:", error);
        socket.emit("server:error", { message: "Error al agregar la nota." });
      }
    });

    socket.on("client:deletenote", async (noteId) => {
      await Note.findByIdAndDelete(noteId);
      emitNotes();
    });

    socket.on("client:getnote", async (noteId) => {
      const note = await Note.findById(noteId);
      socket.emit("server:selectednote", note);
    });

    socket.on("client:updatenote", async (updatedNote) => {
      await Note.findByIdAndUpdate(updatedNote._id, {
        dni: updatedNote.dni,
        mail: updatedNote.mail,
        lote: updatedNote.lote,
      });
      emitNotes();
    });
    
    socket.on("server:error", (error) => {
      alert(error.message); // Mostrar un mensaje de alerta con el error
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "disconnected");
    });
  });
};
