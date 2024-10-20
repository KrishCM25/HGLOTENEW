import { deleteNote, getNoteById, saveNote, updateNote, onError } from "./sockets.js";

const notesList = document.querySelector("#notes");
const dni = document.querySelector("#dni");
const celular = document.querySelector("#celular");
const lote = document.querySelector("#lote");

let savedId = "";

const noteUI = (note) => {
  const div = document.createElement("div");
  const date =new Date(note.createdAt);
  const formattedDate = `${date.getDate()} de ${date.toLocaleString('es-PE', { month: 'long' })} del ${date.getFullYear()}`;
  
    // Convertir el objeto dniInfo a string usando JSON.stringify
  div.classList.add('elem-reserva-data-lt');
  div.innerHTML = `
    <div class="container-elem-reserva-data-lt">
      <div class="container-data-elem-reserva-lt">
        <div class="name-elem-reserva-lt data-elem-reserva-lt">${note.nombre}</div>
        <div class="dni-elem-reserva-lt data-elem-reserva-lt">${note.dni}</div>
        <div class="celular-elem-reserva-lt data-elem-reserva-lt"><p>${note.celular}</p></div>
        <div class="lote-elem-reserva-lt data-elem-reserva-lt"><p>${note.lote}</p></div>
        <div class="regalo-elem-reserva-lt data-elem-reserva-lt">${note.regalo} </div>
        <div class="fecha-elem-reserva-lt data-elem-reserva-lt">${formattedDate} </div>
      </div>
      <div class="control-elem-reserva-lt">
        <div class="container-btn-control-elem">
          <button class="btn btn-danger delete" data-id="${note._id}">delete</button>
          <button class="btn btn-secondary update" data-id="${note._id}">update</button>
        </div>
      </div>
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
  celular.value = note.celular;
  lote.value = note.lote;
  
  savedId = note._id;
};

export const onHandleSubmit = (e) => {
  e.preventDefault();

  if (savedId) {
    updateNote(savedId, dni.value, celular.value, lote.value);
    clearForm(); // Limpiar todos los campos si se actualiza correctamente
  } else {
    // Emitir el evento para crear la nueva nota
    saveNote(dni.value, celular.value, lote.value);
    
    // Escuchar la respuesta del servidor para saber si se creó o no
    onError((response) => {
      if (response.error === "duplicate_lote") {
        // Si el lote está duplicado, solo limpiar el campo lote
        lote.value = "";
        alert(response.message); // Mostrar un mensaje de alerta
      } else {
        clearForm();
        alert("Ocurrió un error al agregar la nota.");
      }
    });
  }
};

// Función para limpiar todos los campos
const clearForm = () => {
  dni.value = "";
  celular.value = "";
  lote.value = "";
};

  