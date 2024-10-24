const socket = io.connect();

/**
 * create a new note
 * @param {string} dni a dni for a new note
 * @param {string} celular a celular for a new note
 * @param {string} lote a lote for a new note
 * @param {string} nombre a nombre for a new note
 * @param {string} regalo a regalo for a new note
 * @param {string} pago a pago for a new note
 */
export const saveNote = (dni, celular, lote,nombre,regalo,pago) => {
  socket.emit("client:newnote", {
    dni,
    celular,
    lote,
    nombre,
    regalo,
    pago,
  });
};

/**
 * delete a note based on an Id
 * @param {string} id a note ID
 */
export const deleteNote = (id) => {
  socket.emit("client:deletenote", id);
};

/**
 *
 * @param {string} id note ID
 * @param {string} dni note dni
 * @param {string} celular note celular
 */
export const updateNote = (_id, dni, celular, lote) => {
  socket.emit("client:updatenote", {
    _id,
    dni,
    celular,
    lote, 
  });
};

/**
 * Load an Array of Notes
 * @param {function} callback A function to render Notes
 */
export const loadNotes = (callback) => {
  socket.on("server:loadnotes", callback);
};

export const onNewNote = (callback) => {
  socket.on("server:newnote", callback);
};

export const onSelected = (callback) => {
  socket.on("server:selectednote", callback);
};

export const getNoteById = (noteId) => {
  socket.emit("client:getnote", noteId);
};
// Escuchar el evento de giro de ruleta desde el servidor
export const onGira = (callback) => {
  socket.on("server:giraruleta", (rotacion) => {
    callback(rotacion);
  });
};

// Escuchar el evento de error del servidor
export const onError = (callback) => {
  socket.on("server:error", callback);
};