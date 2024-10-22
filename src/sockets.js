import Note from "./models/Note";
import axios from 'axios';

export default (io) => {
  io.on("connection", (socket) => {
    // console.log(socket.handshake.url);
    console.log("nuevo socket connectado:", socket.id);

    // Función genérica para ocultar los últimos "numDigits" dígitos de un número
    const maskField = (field, numDigits) => {
      if (field.length >= numDigits) {
        return field.slice(0, -numDigits) + '*'.repeat(numDigits); // Mostrar los primeros dígitos y ocultar los últimos "numDigits"
      }
      return '*'.repeat(field.length); // Si el campo es más corto que "numDigits", ocultar todo con asteriscos
    };

    // Función para enviar todas las notas al cliente
    const emitNotes = async () => {
      const notes = await Note.find();

      // Aplicar la máscara de DNI y celular antes de enviar
      const maskedNotes = notes.map(note => ({
        ...note._doc,  // Clonar los datos de la nota original
        dni: maskField(note.dni, 4),  // Ocultar los últimos 4 dígitos del DNI
        celular: maskField(note.celular || '', 4)  // Ocultar los últimos 4 dígitos del celular (si existe)
      }));

      io.emit("server:loadnotes", maskedNotes);
    };

    emitNotes();

    // Función para consultar la API de DNI
    const fetchDniInfo = async (dni) => {
      const token = 'apis-token-11030.SCSv4kKYWlHpNtJT2xmm5h0Wd4NEHhOw'; // Token para la API
      try {
        console.log("Consultando API de DNI con el número:", dni);
        const dniResponse = await axios.get(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Referer: 'https://apis.net.pe/consulta-dni-api',
          }
        });

        console.log("Respuesta de la API de DNI:", dniResponse.data);

        if (!dniResponse.data || dniResponse.data.error) {
          throw new Error("Error en la consulta de DNI");
        }

        return dniResponse.data; // Devuelve la respuesta de la API si todo está correcto
      } catch (error) {
        console.error("Error en la consulta de DNI:", error.message || error);
        throw error; // Lanzar el error para que pueda ser manejado por la función que llame a `fetchDniInfo`
      }
    };

    // Manejar la creación de una nueva nota
    socket.on("client:newnote", async (data) => {
      try { 
        // Función para obtener un premio aleatorio 
        const obtenerPremioAleatorio = () => {
          const premio = ['BICICLETA','LAVADORA','GIFTCARD', 'VIAJE', 'TV', 'REFRIGERADRA','PREM. CONSUELO'];
          const indiceAleatorio = Math.floor(Math.random() * premio.length);
          return premio[indiceAleatorio].toUpperCase();
        }; 

        // Verificar si ya existe una nota con el mismo valor de "lote"
        const existingNote = await Note.findOne({ lote: data.lote });
        if (existingNote) {
          console.log("Nota con este lote ya existe:", existingNote);
          socket.emit("server:error", { message: "Ya existe una nota con este lote.", error: "duplicate_lote" });
          return; 
        }

        const dniInfo = await fetchDniInfo(data.dni);
        const regalo = obtenerPremioAleatorio();

        // Agregar los datos de la consulta a la nota
        const noteData = {
          dni: data.dni,
          celular: data.celular,
          lote: data.lote,
          nombre: dniInfo.nombres || '',
          regalo:  regalo || 'consuelo',
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
      //  const maskedNotesGet = {
      //   ...note._doc, 
      //   dni: maskField(note.dni, 4), 
      //   celular: maskField(note.celular || '', 4) 
      // };
      socket.emit("server:selectednote", note);
    });
    socket.on("client:updatenote", async (updatedNote) => {
      try {
        // Llamar a la función para consultar el DNI antes de actualizar los datos
        const dniInfo = await fetchDniInfo(updatedNote.dni);
    
        // Actualizar la nota con la información del DNI obtenida
        await Note.findByIdAndUpdate(updatedNote._id, {
          dni: updatedNote.dni,
          celular: updatedNote.celular,
          lote: updatedNote.lote,
          nombre: dniInfo.nombres || '' // Asignar el nombre desde la consulta de DNI
        });
    
        // Emitir las notas actualizadas
        emitNotes();
        
      } catch (error) {
        console.error("Error al actualizar la nota:", error.message || error);
        socket.emit("server:error", { message: "Error al actualizar la nota." });
      }
    });
    
    socket.on("server:error", (error) => {
      alert(error.message); // Mostrar un mensaje de alerta con el error
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "disconnected");
    });
  });
};
