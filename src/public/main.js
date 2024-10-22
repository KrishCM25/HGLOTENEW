import { appendNote, renderNotes, fillForm, onHandleSubmit, giraRuleta } from "./ui.js";
import { loadNotes, onNewNote, onSelected, onGira } from "./sockets.js";

// Load initial Notes
window.addEventListener("DOMContentLoaded", () => {
  loadNotes(renderNotes);
  onNewNote(appendNote);
  onSelected(fillForm);
  onGira(giraRuleta)
});

// Save a new Note
const noteForm = document.querySelector("#ltForm");
noteForm.addEventListener("submit", onHandleSubmit);
