import { deleteNote, getNoteById, saveNote, updateNote } from "./sockets.js";

const notesList = document.querySelector("#notes");
const dni = document.querySelector("#dni");
const mail = document.querySelector("#mail");
const lote = document.querySelector("#lote");

let savedId = "";

const noteUI = (note) => {
  const div = document.createElement("div");
  div.innerHTML = `
  <div class="card card-body rounded-0 animate__animated animate__fadeInUp mb-2">
      <div class="d-flex justify-content-between">
          <h1 class="card-title h3">${note.dni}</h1>
          <div>
              <button class="btn btn-danger delete" data-id="${note._id}">delete</button>
              <button class="btn btn-secondary update" data-id="${note._id}">update</button>
          </div>
      </div>
      <p>${note.mail}</p>
      <p>${note.lote}</p>
  </div>
`;
  const btnDelete = div.querySelector(".delete");
  const btnUpdate = div.querySelector(".update");

  btnDelete.addEventListener("click", () => deleteNote(btnDelete.dataset.id));
  btnUpdate.addEventListener("click", () => getNoteById(btnUpdate.dataset.id));

  return div;
};

export const renderNotes = (notes) => {
  savedId = "";
  notesList.innerHTML = "";
  notes.forEach((note) => notesList.append(noteUI(note)));
};

export const appendNote = (note) => {
  notesList.append(noteUI(note));
};

export const fillForm = (note) => {
  dni.value = note.dni;
  mail.value = note.mail;
  lote.value = note.lote;

  savedId = note._id;
};

export const onHandleSubmit = async (e) => {
  e.preventDefault();

  const noteData = {
    dni: dni.value,
    mail: mail.value,
    lote: lote.value
  };

  try {
    if (savedId) {
      // Actualizar una nota existente
      await updateNote(savedId, noteData.dni, noteData.mail, noteData.lote);
      // Limpiar todos los campos si la nota se envía correctamente
      clearForm();
    } else {
      // Intentar guardar una nueva nota
      const response = await saveNote(noteData.dni, noteData.mail, noteData.lote);
      
      if (response.success) {
        // Limpiar todos los campos si la nota se envía correctamente
        clearForm();
      } else if (response.error && response.error === "duplicate_lote") {
        // Si el lote está duplicado, solo limpiar el campo 'lote'
        lote.value = "";
        alert("El valor del lote ya existe. Por favor, ingresa otro valor.");
      }
    }
  } catch (error) {
    console.error("Error al enviar la nota:", error);
  }
};

// Función para limpiar todos los campos
const clearForm = () => {
  dni.value = "";
  mail.value = "";
  lote.value = "";
};