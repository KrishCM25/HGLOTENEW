import { deleteNote, getNoteById, saveNote, updateNote, onError, onGira} from "./sockets.js";

const notesList = document.querySelector("#notes");
const dni = document.querySelector("#dni");
const celular = document.querySelector("#celular");
const lote = document.querySelector("#lote");

let savedId = "";

const noteUI = (note) => {
  const div = document.createElement("div");
  const date =new Date(note.createdAt);

  // Usar la función para mostrar la fecha formateada
  const formattedDate = formatearFechaRelativa(date);

  // Lógica para determinar si es 'Nuevo' o no (usando 24 horas)
  const diffInHours = (new Date() - date) / (1000 * 60 * 60);

  const isNewNoteText = diffInHours < 24 ? 'Nuevo' : '';


  let imageRegalo ='';
  let cssRegalo ='';
  if(note.regalo == 'REFRIGERADORA'){
    imageRegalo = '/assets/images/refri-hg-30.webp';
    cssRegalo = 'style="width: 27%;top: -20px;right: 10px;"';
  }else if(note.regalo == 'LAVADORA'){
    imageRegalo = '/assets/images/lavadora-hg-83.webp';
    cssRegalo = 'style="width: 40%;top: -20px;right: 10px;"';
  }else if(note.regalo == 'GIFTCARD'){
    imageRegalo = '/assets/images/giftcard-hg-92.webp';
    cssRegalo = 'style="width: 44%;top: -20px;right: 10px;"';
  }else if(note.regalo == 'TV'){
    imageRegalo = '/assets/images/tv-hg-92.webp';
    cssRegalo = 'style="width: 60%;top: -25px;right: 0px;"';
  }else if(note.regalo == 'PREM. CONSUELO'){
    imageRegalo = '/assets/images/ollas-hg-8736.webp'; 
    cssRegalo = 'style="width: 60%;top: -20px;right: 10px;"';
  }else if(note.regalo == 'VIAJE'){
    imageRegalo = '/assets/images/avion-hg-982.webp';
    cssRegalo = 'style="width: 60%;top: -10px;right: 0px;"';
  }else if(note.regalo == 'BICICLETA'){
    imageRegalo = '/assets/images/bici-hg-98.webp';
    cssRegalo = 'style="width: 70%;top: -30px;right: -20px;"';
  }

  const notePago = parseFloat(note.pago)/40;
  let textEstadoPago ='';
  let colorEstadoPago ='';
  if(notePago<100){
    textEstadoPago = `RESERVADO`;
    if(notePago>=1){
      textEstadoPago+= ` ${notePago}%`;
    } 
    colorEstadoPago ='red';
  }else{
    textEstadoPago = 'PROPIETARIO 100%';
  }
  // Convertir el objeto dniInfo a string usando JSON.stringify
    // <div class="regalo-elem-reserva-lt data-elem-reserva-lt">${note.regalo} </div>
    div.classList.add('elem-reserva-data-lt');
    div.innerHTML = `
    <div class="container-elem-reserva-data-lt">
      <div class="container-data-elem-reserva-lt">
        <div class="image-regalo-elem-reserva-lt" ${cssRegalo} ><img src="${imageRegalo}"></div>
        <div class="name-elem-reserva-lt data-elem-reserva-lt">${note.nombre}</div>
        <div class="dni-elem-reserva-lt data-elem-reserva-lt"><span>DNI </span> ${ocultarUltimosCuatroDigitos(note.dni)}</div>
        <div class="celular-elem-reserva-lt data-elem-reserva-lt"><span>TEL </span> ${ocultarUltimosCuatroDigitos(note.celular)}</div>
        <div class="lote-elem-reserva-lt data-elem-reserva-lt" data-lote="${note.lote}"><span>LOTE</span>${note.lote}
          <span class="tag-new-elem-reserva-lt ${isNewNoteText}">${isNewNoteText}</span>
        </div>
        <div class="fecha-elem-reserva-lt data-elem-reserva-lt">${formattedDate} </div>
        <span class="regalo-elem-reserva-lt">${note.regalo}</span>
        <span style="background: url(/assets/images/LOGO-HG-MINI-23.png);width: 15px;height: 15px;position: absolute;z-index: 3;bottom: 10px;right: 5px;background-repeat: no-repeat;background-size: contain;opacity: .6;"></span>
        <span class="pago-elem-reserva-lt ${colorEstadoPago}">${textEstadoPago}</span>
        <span class="bar-elem-reserva-lt" style="width:calc(${notePago}% * 0.8);></span>
      </div>
       
    </div> 
    `; 

  
      // <div class="control-elem-reserva-lt">
      //   <div class="container-btn-control-elem">
      //     <button class="btn btn-danger delete" data-id="${note._id}">delete</button>
      //     <button class="btn btn-secondary update" data-id="${note._id}">update</button>
      //   </div>
      // </div>
  // const btnDelete = div.querySelector(".delete");
  // const btnUpdate = div.querySelector(".update");

  // btnDelete.addEventListener("click", () => deleteNote(btnDelete.dataset.id));
  // btnUpdate.addEventListener("click", () => getNoteById(btnUpdate.dataset.id));

  return div;
};

export const renderNotes = (notes) => {
  savedId = "";
  notesList.innerHTML = "";
  notes.forEach((note) => notesList.append(noteUI(note)));
};

export const appendNote = (note) => {
  notesList.prepend(noteUI(note));
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

export const giraRuleta = (rotacion) => {
  const ruletaD = document.querySelector('.container-ruleta-lt .ruleta-hg-lt');
  if (ruletaD) {
    ruletaD.style.transition = `none`;
    ruletaD.style.transform = `rotate(calc(0deg);`;
    setTimeout(()=>{
      ruletaD.style.transition = `all 9s cubic-bezier(0.14, -0.31, 0, 0.96)`;
      ruletaD.style.transform = `rotate(calc(-${rotacion}deg + 360deg * 11))`;
    },500);
    // ruletaD.style.transform = `rotate(${rotacion}deg)`;
  }
  console.log("GIRANDO ",rotacion);

};

// Escuchar el evento de giro de ruleta desde el servidor
onGira((rotacion) => {
  console.log("Recibida rotación desde el servidor", rotacion);
  giraRuleta(rotacion); // Llama a la función para girar la ruleta
});


// Función para limpiar todos los campos
const clearForm = () => {
  dni.value = "";
  celular.value = "";
  lote.value = "";
};

  
// Función para calcular el formato relativo
const formatearFechaRelativa = (fecha) => {
    const ahora = new Date();
    const diferenciaMs = ahora - fecha;
    const diferenciaSegundos = Math.floor(diferenciaMs / 1000);
    const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    const diferenciaDias = Math.floor(diferenciaHoras / 24);

    if (diferenciaSegundos < 60) {
        return "Hace instantes";
    } else if (diferenciaMinutos < 60) {
        return `Hace ${diferenciaMinutos} ${diferenciaMinutos === 1 ? 'minuto' : 'minutos'}`;
    } else if (diferenciaHoras < 24) {
        return `Hace ${diferenciaHoras} ${diferenciaHoras === 1 ? 'hora' : 'horas'}`;
    } else if (diferenciaDias < 5) {
        return `Hace ${diferenciaDias} ${diferenciaDias === 1 ? 'día' : 'días'}`;
    } else {
        return `${fecha.getDate()} de ${fecha.toLocaleString('es-PE', { month: 'long' })} del ${fecha.getFullYear()}`;
    }
};

// Función para ocultar los últimos 4 dígitos de un número
function ocultarUltimosCuatroDigitos(numero) {
  return numero.slice(0, -4) + '****';
}
