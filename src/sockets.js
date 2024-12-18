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
      const notes = await Note.find().sort({ createdAt: -1 });

      // Aplicar la máscara de DNI y celular antes de enviar
      const maskedNotes = notes.map(note => ({
        ...note._doc,  // Clonar los datos de la nota original
        dni: maskField(note.dni, 4),  // Ocultar los últimos 4 dígitos del DNI
        celular: maskField(note.celular || '', 4)  // Ocultar los últimos 4 dígitos del celular (si existe)
      }));

      socket.emit("server:loadnotes", maskedNotes);
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

    // // Función para agregar el campo 'pago' a todas las notas si no existe
    // const actualizarNotasConPago = async () => {
    //   try {
    //     // Actualizar todas las notas que no tienen el campo 'pago' o donde está undefined
    //     const result = await Note.updateMany(
    //       { pago: { $exists: true } }, // Busca todas las notas donde 'pago' no existe
    //       { $set: { pago: "4000" } } // Agrega el campo 'pago' con el valor por defecto ""
    //     );

    //     console.log(`${result.nModified} notas actualizadas.`);
    //   } catch (error) {
    //     console.error("Error al actualizar las notas:", error);
    //   }
    // };

    // // Ejecutar la función
    // actualizarNotasConPago();

    // Manejar la creación de una nueva nota
    socket.on("client:newnote", async (data) => {
      try { 
        // Función para obtener un premio aleatorio 
        const obtenerPremioAleatorio = () => {
          const premios = [
            { nombre: 'BICICLETA', probabilidad: 7 },  
            { nombre: 'LAVADORA', probabilidad: 5 },    
            { nombre: 'GIFTCARD', probabilidad: 4 },
            { nombre: 'VIAJE', probabilidad: 1 },
            { nombre: 'TV', probabilidad: 5 },
            { nombre: 'REFRIGERADORA', probabilidad: 4 },
            { nombre: 'PREM. CONSUELO', probabilidad: 4 } 
          ];
        
          // Expandir el array según la probabilidad de cada premio
          const bolsaDePremios = premios.flatMap(premio => Array(premio.probabilidad).fill(premio.nombre));
        
          // Seleccionar un premio aleatoriamente
          const indiceAleatorio = Math.floor(Math.random() * bolsaDePremios.length);
          return bolsaDePremios[indiceAleatorio].toUpperCase();
        };

       
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
          pago: data.pago || '0',
        };

        let rotacionRuleta = 0;

        if(regalo == 'REFRIGERADORA'){
          rotacionRuleta = 5*60;
        }else if(regalo == 'LAVADORA'){
          rotacionRuleta = 1*60;
        }else if(regalo == 'GIFTCARD'){
          rotacionRuleta = 3*60;
        }else if(regalo == 'TV'){
          rotacionRuleta = 2*60;
        }else if(regalo == 'PREM. CONSUELO'){
          rotacionRuleta = 90;
        }else if(regalo == 'VIAJE'){
          rotacionRuleta = 0*60;
        }else if(regalo == 'BICICLETA'){
          rotacionRuleta = 4*60;
        }
          
        // Si no existe una nota con el mismo lote, se crea una nueva
        const newNote = new Note(noteData); // Crear la nota con la información del DNI
        // Emite el evento de rotación solo al cliente que envió la nota
        socket.emit("server:giraruleta", rotacionRuleta);
        const savedNote = await newNote.save();
        setTimeout(()=>{
          io.emit("server:newnote", savedNote); // Emitir la nota nueva a todos los clientes conectados
        },7000);
        
      } catch (error) {
        console.error("Error al agregar una nueva nota:", error.response ? error.response.data : error.message);
        socket.emit("server:error", { message: "Error al agregar la nota." });
      }
    });

    // socket.on("server:giraruleta", (rotacionRuleta) => {
    //   console.log("Rotación recibida:", rotacionRuleta);
    //   socket.emit("client:giraruleta", rotacionRuleta); 
    // });

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
