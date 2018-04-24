var fs = require('fs');
var fsr = require('fs-extra');
const path = require('path');
var recursive = require("recursive-readdir-synchronous");
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
//variable per agafar dimensio de la primera imatge
var first_image = 0
var tab_class=""

var dades_dataset = {
  name: dataset_name,
  train_dir: train_directory,
  validation_dir: validation_directory,
  image_size: 0,
  classes: {
    num_classes: 0,
    info: {

    }
  }
}
var obj_class = {
  train_dir: train_directory,
  validation_dir: validation_directory,
  num_train: 0,
  num_validation: 0
}
var actual_class = ""
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per crear tabs amb numero de clases x//////////////////
let num_classes = document.querySelector('#number-of-classes')
let r_classes = document.querySelector('#input-classes')
num_classes.addEventListener('click', () => {
  /*
   *Agafem el numero introduit en el input de clases y creem aquest numero de
   *tabs. A cada tab li ficarem un identificador diferent.
   */
  var id_class = "classes";
  dades_dataset["classes"]["num_classes"] = r_classes.value
  for (i = 0; i < r_classes.value; i++) {
    //Asi creem les carpetes de cada una de les clases tant per a l'entrenamiento
    //com per a validacio
    if (!fs.existsSync(dades_dataset["train_dir"] + "/" + id_class + i)) {
      fs.mkdirSync(dades_dataset["train_dir"] + "/" + id_class + i);
    }
    if (!fs.existsSync(dades_dataset["validation_dir"] + "/" + id_class + i)) {
      fs.mkdirSync(dades_dataset["validation_dir"] + "/" + id_class + i);
    }
    //Asi creeem dinamicament cada un dels componenets necesaris per arreplegar
    //les dades per a cada clase. Nom de la clase, afegir i eliminar images d'entrenament
    // i validacio, guardar clase, eliminar clase.
    if (i === 0) {

      $("#tab-default").remove();
      $("<li class='tab text-white' id='tab-class' value='" + id_class + i + "'><a href='#" + id_class + i + "'> " + id_class + i + " </a></li>").appendTo("#tab-classes");
      $("<div id='" + id_class + i + "' class='col s12' style='display:none;'><div class='row' id='row-" + id_class + i + "'></div></div>").appendTo("#principal-tab-classes");
      $("<form id='" + id_class + i + "'>").appendTo("#" + id_class + i);
      $("<div class='row'><div class='input-field col s6'> <input id='name-" + id_class + i + "' type='text' class='validate'> <label for='name-" + id_class + i + "'>Class Name</label> </div></div>").appendTo("#" + id_class + i);
      $('<div class="row" id="set-img-' + id_class + i + '"> <div class="col s6"><div class="btn waves-effect waves-light" id="set-train-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Train Images</span> </div><div> </div>').appendTo("#" + id_class + i);
      $('<div class="col s6"> <div class="btn waves-effect waves-light" id="set-validation-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Validation Images</span> </div></div>').appendTo("#set-img-" + id_class + i);
      $('<div class="row" id="delete-img-' + id_class + i + '"> <div class="col s6"><div class="btn waves-effect waves-light red lighten-1" id="delete-train-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Train Images</span> </div><div> </div>').appendTo("#" + id_class + i);
      $('<div class="col s6"> <div class="btn waves-effect waves-light red lighten-1" id="delete-validation-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Validation Images</span> </div></div>').appendTo("#delete-img-" + id_class + i);
      $('<div class="row" id="info-data-' + id_class + i + '"> <div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Train info.</span> <p  id="new-num-train-img'+ id_class + i +'">Number of train images: 0 </p><p>Directory: ' + dades_dataset["train_dir"] + '/' + id_class + i + '</p></div></div></div> ').appendTo("#" + id_class + i);
      $('<div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Validation info.</span> <p id="new-num-validation-img'+ id_class + i +'">Number of validation images: 0</p> <p>Directory: ' + dades_dataset["validation_dir"] + '/' + id_class + i + '</p> </div> </div> </div> </div>').appendTo("#info-data-" + id_class + i);
      $('<div class="row"> <div class="col s3 offset-s6"><div class="btn waves-effect waves-light green lighten-2" id="set-class"  style="width: 100%;"  value="' + id_class + i + '"><i class="material-icons right">check</i><span>Save Class</span> </div></div><div class="col s3"><div class="btn waves-effect waves-light red lighten-2" id="set-class" style="width: 100%;"><i class="material-icons right">clear</i><span>Delete Class</span> </div><div></div>').appendTo("#" + id_class + i);
      $("</form>");
    } else {

      $("<li class='tab text-white' id='tab-class' value='" + id_class + i + "'><a href='#" + id_class + i + "' > " + id_class + i + "</a></li>").appendTo("#tab-classes");
      $("<div id='" + id_class + i + "' class='col s12' style='display:none;'><div class='row' id='row-" + id_class + i + "'></div></div>").appendTo("#principal-tab-classes");
      $("<form id='" + id_class + i + "'>").appendTo("#" + id_class + i);
      $("<div class='row'><div class='input-field col s6'> <input id='name-" + id_class + i + "' type='text' class='validate'> <label for='name-" + id_class + i + "'>Class Name</label> </div></div>").appendTo("#" + id_class + i);
      $('<div class="row" id="set-img-' + id_class + i + '"> <div class="col s6"><div class="btn waves-effect waves-light" id="set-train-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Train Images</span> </div><div> </div>').appendTo("#" + id_class + i);
      $('<div class="col s6"> <div class="btn waves-effect waves-light" id="set-validation-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Validation Images</span> </div></div>').appendTo("#set-img-" + id_class + i);
      $('<div class="row" id="delete-img-' + id_class + i + '"> <div class="col s6"><div class="btn waves-effect waves-light red lighten-1" id="delete-train-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Train Images</span> </div><div> </div>').appendTo("#" + id_class + i);
      $('<div class="col s6"> <div class="btn waves-effect waves-light red lighten-1" id="delete-validation-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Validation Images</span> </div></div>').appendTo("#delete-img-" + id_class + i);
      $('<div class="row" id="info-data-' + id_class + i + '"> <div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Train info.</span> <p  id="new-num-train-img'+ id_class + i +'">Number of train images: 0 </p><p>Directory: ' + dades_dataset["train_dir"] + '/' + id_class + i + '</p></div></div></div> ').appendTo("#" + id_class + i);
      $('<div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Validation info.</span> <p  id="new-num-validation-img'+ id_class + i +'">Number of validation images: 0</p> <p>Directory: ' + dades_dataset["validation_dir"] + '/' + id_class + i + '</p> </div> </div> </div> </div>').appendTo("#info-data-" + id_class + i);
      $('<div class="row"> <div class="col s3 offset-s6"><div class="btn waves-effect waves-light green lighten-2" id="set-class" style="width: 100%;" value="' + id_class + i + '"><i class="material-icons right">check</i><span>Save Class</span> </div></div><div class="col s3"><div class="btn waves-effect waves-light red lighten-2" id="set-class" style="width: 100%;"><i class="material-icons right">clear</i><span>Delete Class</span> </div><div></div>').appendTo("#" + id_class + i);
      $("</form>");
    }
  }
})
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per guadar DataSet//////////////////
$(document).on('click', "#save-dataset", function() {
  //console.log(dades_dataset)
  //  dades_dataset["classes"]["info"].push()
})
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per seleccionar imatges d'entrenament//////////////////
/*
 *Per a copiar imatges d'un directori a altre ho fem mitjançan crides asincrones
 *Per quedarnos amb el nom del fitxer ha sigut necesari importar "path"
 *Aquesta funcio copia multiple fitxers
 *Es necesari saber a quina clase corresponen les imatges "actual_class"
 */
$(document).on('click', "#set-train-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files.forEach(function(value) {
      if (!first_image) {
        let sizeOf = require('image-size');
        let dimensions = sizeOf(value);
        let size_image = dimensions.width.toString() + "*" + dimensions.height.toString()
        console.log(size_image);
        dades_dataset["image_size"] = size_image
        first_image = 1
      }
      console.log(value + "---->" + dades_dataset["train_dir"] + "/" + actual_class);
      fsr.copy(value, dades_dataset["train_dir"] + "/" + actual_class + "/" + path.basename(value))
        .then(() => count_img(dades_dataset["train_dir"] + "/" + actual_class, "#new-num-train-img"+actual_class, "Number of train images: "))
        .catch(err => console.error(err))
    })

  }
})
////////////////////////////////////////////////////////////////////////////////
///////////////////Event per seleccionar imatges de validació//////////////////
/*
 *Per a copiar imatges d'un directori a altre ho fem mitjançan crides asincrones "fs-extra"
 *Per quedarnos amb el nom del fitxer ha sigut necesari importar "path"
 *Aquesta funcio copia multiple fitxers
 *Es necesari saber a quina clase corresponen les imatges "actual_class"
 */

$(document).on('click', "#set-validation-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files.forEach(function(value) {
      console.log(value + "---->" + dades_dataset["validation_dir"] + "/" + actual_class);
      fsr.copy(value, dades_dataset["validation_dir"] + "/" + actual_class + "/" + path.basename(value))
        .then(() => count_img(dades_dataset["validation_dir"] + "/" + actual_class, "#new-num-validation-img"+actual_class, "Number of validation images: "))
        .catch(err => console.error(err))
    });
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per eliminar imatges d'entrenament//////////////////
/*
 *Per eliminar imatges d'un directori a altre ho fem mitjançan crides asincrones "fs-extra"
 *Per quedarnos amb el nom del fitxer ha sigut necesari importar "path"
 *Aquesta funcio elimina multiple fitxers
 *Es necesari saber a quina clase corresponen les imatges "actual_class"
 */

$(document).on('click', "#delete-train-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files.forEach(function(value) {
      fsr.remove(value, err => {
        if (err) return console.error(err)
        count_img(dades_dataset["train_dir"] + "/" + actual_class, "#new-num-train-img"+actual_class, "Number of train images: ")
        console.log('success!')
      })
    });
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per eliminar imatges de validacio/////////////////////
/*
 *Per eliminar imatges d'un directori a altre ho fem mitjançan crides asincrones "fs-extra"
 *Per quedarnos amb el nom del fitxer ha sigut necesari importar "path"
 *Aquesta funcio elimina multiple fitxers
 *Es necesari saber a quina clase corresponen les imatges "actual_class"
 */

$(document).on('click', "#delete-validation-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files.forEach(function(value) {
      fsr.remove(value, err => {
        if (err) return console.error(err)
        count_img(dades_dataset["validation_dir"] + "/" +  actual_class, "#new-num-validation-img"+actual_class, "Number of validation images: ")
        console.log('success!')
      })
    });
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per guardar configuració d'alguna clase////////////////
$(document).on('click', "#set-class", function() {
  //console.log($(this).attr('value'));
  let name = document.getElementById("name-" + actual_class).value;
  dades_dataset["classes"]["info"][actual_class]["name_class"] = name;

  //reanomenem els directoris amb el nom de la clase
  fs.rename(dades_dataset["train_dir"] + "/" + actual_class, dades_dataset["train_dir"] + "/" + name, function(err) {
    if (err) throw err;
    console.log('renamed complete');
  });
  fs.rename(dades_dataset["validation_dir"] + "/" + actual_class, dades_dataset["validation_dir"] + "/" + name, function(err) {
    if (err) throw err;
    console.log('renamed complete');
  });

  //Canviem els directoris per defecte
  let train_dir = dades_dataset["train_dir"] + "/" + name;
  let val_dir = dades_dataset["validation_dir"] + "/" + name;
  dades_dataset.classes.info[actual_class]["train_dir"] = train_dir;
  dades_dataset.classes.info[actual_class]["validation_dir"] = val_dir;

  fs.readdir(train_dir, (err, files) => {
    dades_dataset["classes"]["info"][actual_class]["num_train"] = files.length;
    console.log(files.length);
    console.log("Num_train-->", dades_dataset["classes"]["info"][actual_class]["num_train"]);
  });
  fs.readdir(val_dir, (err, files) => {
    dades_dataset["classes"]["info"][actual_class]["num_validation"] = files.length;
  });
  console.log("entra");
  console.log(JSON.stringify(dades_dataset));


})
////////////////////////////////////////////////////////////////////////////////
//FALTA VORER COM ARREGLEM LO DEL JSON
///////////////////Event per saber la clase actual//////////////////////////////
$(document).on('click', "#tab-class", function() {
  actual_class = $(this).attr('value');
  count_img(dades_dataset["train_dir"] + "/" + $(this).attr('value'), "#new-num-train-img"+$(this).attr('value'), "Number of train images: ")
  count_img(dades_dataset["validation_dir"] + "/" + $(this).attr('value'), "#new-num-validation-img"+$(this).attr('value'), "Number of validation images: ")
  let obj_class = {
    name_class: "",
    train_dir: dades_dataset["train_dir"] + "/" + actual_class,
    validation_dir: dades_dataset["validation_dir"] + "/" + actual_class,
    num_train: 0,
    num_validation: 0
  }
  //sols creem el objecte de cada clase una vegada
  if (!dades_dataset.classes.info.hasOwnProperty(actual_class)) {
    dades_dataset.classes.info[actual_class] = {};
    dades_dataset.classes.info[actual_class] = obj_class;
  }

  //dades_dataset["classes"]["info"].push(obj_class);
  console.log(JSON.stringify(dades_dataset));
})
////////////////////////////////////////////////////////////////////////////////


/////////Event per seleccionar ruta on guardar les dades del dataset////////////
let textoSave = document.querySelector('#directori-dataset-json-input')
let directoriSave = document.querySelector('#directori-dataset-json')
directoriSave.addEventListener('click', () => {
  name = document.getElementById("dataset_name").value;
  dades_dataset.name = name;
  const directory = dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (directory) {
    textoSave.value = directory[0]
    //Guardem la configuració del dataset
    fs.writeFile(directory[0] + "/" + name + ".json", JSON.stringify(dades_dataset), (err) => {
      if (err) {
        console.error(err);
        return;
      };
      //Guardem la ruta i el nom del dataset
      console.log("File has been created");
    });
  }
})
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per seleccionar ruta entrenamiento///////////////
let textoTrain = document.querySelector('#train-directory')
let directoriTrain = document.querySelector('#directori-train')
directoriTrain.addEventListener('click', () => {
  const directory = dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (directory) {
    textoTrain.value = directory[0]
    dades_dataset["train_dir"] = directory[0] + '/train'
    console.log(directory[0])
    if (!fs.existsSync(directory[0] + '/train')) {
      fs.mkdirSync(directory[0] + '/train');
    }
  }
})
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per seleccionar ruta de validacion///////////////
let textoTest = document.querySelector('#test-directory')
let directoriTest = document.querySelector('#directori-test')
directoriTest.addEventListener('click', () => {
  const directory = dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (directory) {
    textoTest.value = directory[0]
    dades_dataset["validation_dir"] = directory[0] + '/validation'
    console.log(directory[0])
    if (!fs.existsSync(directory[0] + '/validation')) {
      fs.mkdirSync(directory[0] + '/validation');
    }
  }
})
////////////////////////////////////////////////////////////////////////////////

//////////////////////////Contar Fitxers////////////////////////////////////////
function count_img(directory, type, cad) {
  //contar arxius en subdirectoris, de forma sincrona per actualizar valors
  let files = recursive(directory);
  console.log(directory + " " + type + " " + cad);
  $(type).html(cad + " " + files.length);
  //document.getElementById(type).value = files.length

}
////////////////////////////////////////////////////////////////////////////////
