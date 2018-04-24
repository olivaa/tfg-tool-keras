var fs = require('fs');
var fsr = require('fs-extra');
const path = require('path');

///////////////////Dependencias per accedir a l'explorador d'arxius/////////////
const {
  remote
} = require('electron');
const {
  app,
  dialog
} = require('electron').remote;
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////Dades dataset/////////////////////////////////////
var train_directory = ""
var validation_directory = ""
var dataset_name = ""

var dades_dataset = {
  name: dataset_name,
  train_dir: train_directory,
  validation_dir: validation_directory,
  classes: {
    num_classes: 0,
    info: {

    }
  }
}
let obj_class = {
  train_dir: train_directory,
  validation_dir: validation_directory,
  num_train: 0,
  num_validation: 0
}
let actual_class = ""
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per carregar tabs amb numero de clases x//////////////////
let num_classes = document.querySelector('#number-of-classes')
let r_classes = document.querySelector('#input-classes')

function readClases() {
  /*
   *Carregem el numero de classes desde l'objecte
   */
  let id_class = "classes";
  let name_dataset = dades_dataset["name"];
  let train_dir = dades_dataset["train_dir"];
  let validation_dir = dades_dataset["validation_dir"];
  let num_classes = dades_dataset["classes"]["num_classes"];
  let obj_classes = dades_dataset["classes"]["info"];
  console.log("objecte", obj_classes)
  if (num_classes > 0) {
    $("#load-tab-default").remove();
  }
  for (i = 0; i < num_classes; i++) {

    let name_class = obj_classes[id_class + i]["name_class"];
    let num_train = obj_classes[id_class + i]["num_train"];
    let num_validation = obj_classes[id_class + i]["num_validation"];
    let dir_train = obj_classes[id_class + i]["train_dir"];
    let dir_validation = obj_classes[id_class + i]["validation_dir"];

    //Asi creeem dinamicament cada un dels componenets necesaris per arreplegar
    //les dades per a cada clase. Nom de la clase, afegir i eliminar images d'entrenament
    // i validacio, guardar clase, eliminar clase.

    $("<li class='tab text-white' id='load-tab-class' value='" + id_class + i + "'><a href='#load-" + id_class + i + "'> " + name_class + " </a></li>").appendTo("#load-tab-classes");
    $("<div id='load-" + id_class + i + "' class='col s12' style='display:none;'><div class='row' id='load-row-" + id_class + i + "'></div></div>").appendTo("#load-principal-tab-classes");
    $("<form id='load-" + id_class + i + "'>").appendTo("#load-" + id_class + i);
    $("<div class='row'><div class='input-field col s6'> <input id='load-name-" + id_class + i + "' type='text' class='validate' value='" + name + "'> <label for='name-" + id_class + i + "'>Class Name</label> </div></div>").appendTo("#load-" + id_class + i);
    $('<div class="row" id="load-set-img-' + id_class + i + '"> <div class="col s6"><div class="btn waves-effect waves-light" id="load-set-train-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Train Images</span> </div><div> </div>').appendTo("#load-" + id_class + i);
    $('<div class="col s6"> <div class="btn waves-effect waves-light" id="load-set-validation-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Validation Images</span> </div></div>').appendTo("#load-set-img-" + id_class + i);
    $('<div class="row" id="load-delete-img-' + id_class + i + '"> <div class="col s6"><div class="btn waves-effect waves-light red lighten-1" id="load-delete-train-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Train Images</span> </div><div> </div>').appendTo("#load-" + id_class + i);
    $('<div class="col s6"> <div class="btn waves-effect waves-light red lighten-1" id="load-delete-validation-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Validation Images</span> </div></div>').appendTo("#load-delete-img-" + id_class + i);
    $('<div class="row" id="load-info-data-' + id_class + i + '"> <div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Train info.</span> <p>Number of train images: '+num_train+' </p><p>Directory: ' + dir_train + '</p></div></div></div> ').appendTo("#load-" + id_class + i);
    $('<div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Validation info.</span> <p>Number of validation images:'+num_validation+ ' </p> <p>Directory: ' + dir_validation + '</p> </div> </div> </div> </div>').appendTo("#load-info-data-" + id_class + i);
    $('<div class="row"> <div class="col s3 offset-s6"><div class="btn waves-effect waves-light green lighten-2" id="load-set-class"  style="width: 100%;"  value="' + id_class + i + '"><i class="material-icons right">check</i><span>Save Class</span> </div></div><div class="col s3"><div class="btn waves-effect waves-light red lighten-2" id="load-set-class" style="width: 100%;"><i class="material-icons right">clear</i><span>Delete Class</span> </div><div></div>').appendTo("#load-" + id_class + i);
  }

}
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per seleccionar fitxer amb dades json//////////////////
$(document).on('click', "#get-json-dataset", function() {
  const file = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [ { path: [ './hone' ]} ],
  });
  if (file) {
    console.log(file);
    dades_dataset = JSON.parse(fs.readFileSync(file[0], 'utf8'));
    console.log(dades_dataset);
    //carregem les dades
    readClases();
  }
})
////////////////////////////////////////////////////////////////////////////////
