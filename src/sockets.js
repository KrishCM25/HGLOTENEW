import Note from "./models/Note";

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
        const existingNote = await Note.findOne({ lote: data.lote });
        if (existingNote) {
          // Enviar respuesta si el lote ya existe
          socket.emit("server:error", { message: "Ya existe una nota con este lote.", error: "duplicate_lote" });
          return;
        }
    
        // Guardar la nueva nota si no hay duplicado
        const newNote = new Note(data);
        const savedNote = await newNote.save();
        io.emit("server:newnote", savedNote); // Emitir la nota nueva a todos los clientes conectados
      } catch (error) {
        console.error("Error al guardar la nota:", error);
        socket.emit("server:error", { message: "Error al agregar la nota.", error: "server_error" });
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
