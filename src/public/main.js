import { appendNote, renderNotes, fillForm, onHandleSubmit, giraRuleta } from "./ui.js";
import { loadNotes, onNewNote, onSelected, onGira } from "./sockets.js";

// Cargar notas iniciales
window.addEventListener("DOMContentLoaded", () => {
  loadNotes(renderNotes);
  onNewNote(appendNote);
  onSelected(fillForm);
  onGira(giraRuleta); // Escuchar la rotación de la ruleta
});

// Save a new Note
const noteForm = document.querySelector("#ltForm");
noteForm.addEventListener("submit", onHandleSubmit);
