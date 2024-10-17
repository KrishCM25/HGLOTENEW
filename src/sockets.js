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

    
    // Manejar la creación de una nueva nota
    socket.on("client:newnote", async (data) => {
      try {
        // Token para autenticar la consulta del DNI
        const token = 'apis-token-11030.SCSv4kKYWlHpNtJT2xmm5h0Wd4NEHhOw';

        // Verificar si ya existe una nota con el mismo valor de "lote"
        const existingNote = await Note.findOne({ lote: data.lote });
        if (existingNote) {
          console.log("Nota con este lote ya existe:", existingNote);
          socket.emit("server:error", { message: "Ya existe una nota con este lote.", error: "duplicate_lote" });
          return;
        }

        // Consulta el DNI usando la API antes de crear la nota
        console.log("Consultando API de DNI con el número:", data.dni);

        const dniResponse = await axios.get(`https://api.apis.net.pe/v2/reniec/dni?numero=${data.dni}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Referer: 'https://apis.net.pe/consulta-dni-api'
          }
        });

        console.log("Respuesta de la API de DNI:", dniResponse.data);

        if (!dniResponse.data || dniResponse.data.error) {
          console.error("Error en la consulta de DNI:", dniResponse.data.error);
          socket.emit("server:error", { message: "Error al consultar el DNI.", error: "dni_error" });
          return;
        }

        // Agregar los datos de la consulta a la nota
        const noteData = {
          dni: data.dni,
          mail: data.mail,
          lote: data.lote,
          nombre: dniResponse.data.nombres || '',
        };

        // Si no existe una nota con el mismo lote, se crea una nueva
        const newNote = new Note(noteData); // Crear la nota con la información del DNI
        const savedNote = await newNote.save();
        io.emit("server:newnote", savedNote); // Emitir la nota nueva a todos los clientes conectados

      } catch (error) {
        console.error("Error al agregar una nueva nota:", error.response ? error.response.data : error.message);
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
