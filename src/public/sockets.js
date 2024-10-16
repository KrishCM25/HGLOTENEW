const socket = io.connect();

/**
 * create a new note
 * @param {string} dni a dni for a new note
 * @param {string} mail a mail for a new note
 * @param {string} lote a lote for a new note
 */
export const saveNote = (dni, mail, lote) => {
  socket.emit("client:newnote", {
    dni,
    mail,
    lote,
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
 * @param {string} mail note mail
 */
export const updateNote = (_id, dni, mail, lote) => {
  socket.emit("client:updatenote", {
    _id,
    dni,
    mail,
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
