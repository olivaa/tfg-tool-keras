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
var first_image = 0
var element_tab = ""

var dades_dataset = {}
let obj_class = {}
//Respecte a la diferencia entre name_class y actual_class, name_class ens fa
//servir per saber quin es el directori de la clase en camvi actual_class ens
//indica l'identificador de la clase per a la ferramenta per mantindre sempre un
//identificador encara que l'usuario canvie el nom de la clase
let actual_class = ""
let name_class = ""
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

  for (var key in obj_classes) {

    let name_class = obj_classes[key]["name_class"];
    let num_train = obj_classes[key]["num_train"];
    let num_validation = obj_classes[key]["num_validation"];
    let dir_train = obj_classes[key]["train_dir"];
    let dir_validation = obj_classes[key]["validation_dir"];

    //Asi creeem dinamicament cada un dels componenets necesaris per arreplegar
    //les dades per a cada clase. Nom de la clase, afegir i eliminar images d'entrenament
    // i validacio, guardar clase, eliminar clase.

    $("<li class='tab text-white' id='load-tab-class' value='" + key + "'><a href='#load-" + key + "'> " + name_class + " </a></li>").appendTo("#load-tab-classes");
    $("<div id='load-" + key + "' class='col s12' style='display:none;'><div class='row' id='load-row-" + key + "'></div></div>").appendTo("#load-tabs");
    $("<form id='load-" + key + "'>").appendTo("#load-" + key);
    $("<div class='row'><div class='input-field col s6' id='load-input-name'> <input id='load-name-" + key + "' type='text' class='validate' value='" + name_class + "'> <label for='name-" + key + "'></label> </div></div>").appendTo("#load-" + key);
    $('<div class="row" id="load-set-img-' + key + '"> <div class="col s6"><div class="btn waves-effect waves-light" id="load-set-train-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Train Images</span> </div><div> </div>').appendTo("#load-" + key);
    $('<div class="col s6"> <div class="btn waves-effect waves-light" id="load-set-validation-images" style="width: 100%;"><i class="material-icons right">file_upload</i> <span>Add Validation Images</span> </div></div>').appendTo("#load-set-img-" + key);
    $('<div class="row" id="load-delete-img-' + key + '"> <div class="col s6"><div class="btn waves-effect waves-light red lighten-1" id="load-delete-train-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Train Images</span> </div><div> </div>').appendTo("#load-" + key);
    $('<div class="col s6"> <div class="btn waves-effect waves-light red lighten-1" id="load-delete-validation-images" style="width: 100%;"><i class="material-icons right">delete</i> <span>Delete Validation Images</span> </div></div>').appendTo("#load-delete-img-" + key);
    $('<div class="row" id="load-info-data-' + key + '"> <div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Train info.</span> <p id="load-num-train-img' + key + '">Number of train images: ' + num_train + ' </p><p>Directory: ' + dir_train + '</p></div></div></div> ').appendTo("#load-" + key);
    $('<div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Validation info.</span> <p  id="load-num-validation-img' + key + '">Number of validation images:' + num_validation + ' </p> <p>Directory: ' + dir_validation + '</p> </div> </div> </div> </div>').appendTo("#load-info-data-" + key);
    $('<div id="row"> <div class="col s6"> <div class="scrollbar" id="style-1"> <div class="force-overflow"> <div id="gallery-load-' + key + '-train"></div> </div> </div> </div> <div class="col s6"> <div class="scrollbar-2" id="style-1"> <div class="force-overflow"> <div id="gallery-load-' + key + '-validation"> </div> </div> </div> </div> </div> </div>').appendTo("#load-" + key)
    $('<div class="row"> <div class="col s3 offset-s6"><div id="load-show-save-' + key + '" style="visibility:hidden;"><div class="btn waves-effect waves-light green lighten-2 modal-trigger" id="load-set-class" style="width: 100%;"  value="' + key + '"><i class="material-icons right">check</i><span>Save Class</span></div></div></div><div class="col s3"><div class="btn waves-effect waves-light red lighten-2" id="load-delete-class" style="width: 100%;"><i class="material-icons right">clear</i><span>Delete Class</span> </div><div></div>').appendTo("#load-" + key);
  }

}
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////Eliminar dataset//////////////////////////////////
$(document).on('click', "#load-delete-dataset", function() {
  console.log("entra")
  //reactivem el botó de crear
  $("#load-number-of-classes").attr('disabled', null);
  //elimina capçalera dels tabs
  $('#load-tab-classes').empty()
  //elimina divs amb info dels tabs
  $('#load-tabs').empty()
  //posem tab per defecte
  $('<li class="tab text-white" id="load-tab-default"><a href="#">Default</a></li> ').appendTo('#load-tab-classes')
  //reiniciem inputs
  $('#train-directory').val("")
  $('#test-directory').val("")
})

///////////////////////////////////////////////////////////////////////////////

///////////////////Event per seleccionar fitxer amb dades json//////////////////
$(document).on('click', "#get-json-dataset", function() {
  const file = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{
      path: ['./home']
    }],
  });
  if (file) {
    console.log(file);
    let name_file = file
    $('#load_dataset_name').val(name_file)
    dades_dataset = JSON.parse(fs.readFileSync(file[0], 'utf8'));
    console.log(dades_dataset);
    //carregem les dades
    readClases();
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per seleccionar imatges d'entrenament//////////////////
/*
 *Per a copiar imatges d'un directori a altre ho fem mitjançan crides asincrones
 *Per quedarnos amb el nom del fitxer ha sigut necesari importar "path"
 *Aquesta funcio copia multiple fitxers
 *Es necesari saber a quina clase corresponen les imatges "actual_class"
 */
$(document).on('click', "#load-set-train-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files_count = 0;
    files.forEach(function(value) {
      if (!first_image) {
        let sizeOf = require('image-size');
        let dimensions = sizeOf(value);
        let size_image = dimensions.width.toString() + "*" + dimensions.height.toString()
        console.log(size_image);
        dades_dataset["image_size"] = size_image
        first_image = 1
      }

      console.log(value + "---->" + dades_dataset["train_dir"] + "/" + name_class);
      fsr.copy(value, dades_dataset["train_dir"] + "/" + name_class + "/" + path.basename(value))
        .then(() => count_img(dades_dataset["train_dir"] + "/" + name_class, "#load-num-train-img" + actual_class, "Number of train images: "))
        .then(() => show_img(dades_dataset["train_dir"] + "/", "train", path.basename(value)))
        .catch(err => console.error(err))
    })
    //Cridem a la funció per a que carrege les imatges
    /*if (files_count == files.length) {
      show_img(dades_dataset["train_dir"] + "/")
    }*/
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Activar o desactivar guardar Dataset/////////////////////////
$(document).on('click', "#load-input-name", function() {
  console.log("entra")
  let name = document.getElementById("load-name-" + actual_class).value
  if (name != dades_dataset["classes"]["info"][actual_class]["name_class"] || name != "") {
    $("#load-show-save-" + actual_class).css("visibility", "initial");
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per guardar configuració d'alguna clase////////////////
$(document).on('click', "#load-set-class", function() {
  //console.log($(this).attr('value'));
  let name = document.getElementById("load-name-" + actual_class).value;

  //Sols reanomenem els directoris si ha cambiat el nom de la clase
  if (name != dades_dataset["classes"]["info"][actual_class]["name_class"]) {
    let old_name = dades_dataset["classes"]["info"][actual_class]["name_class"]
    //reanomenem els directoris amb el nom de la clase
    fs.rename(dades_dataset["train_dir"] + "/" + old_name, dades_dataset["train_dir"] + "/" + name, function(err) {
      if (err) throw err;
      console.log('renamed complete');
    })
    fs.rename(dades_dataset["validation_dir"] + "/" + old_name, dades_dataset["validation_dir"] + "/" + name, function(err) {
      if (err) throw err;
      console.log('renamed complete');
    })
    dades_dataset["classes"]["info"][actual_class]["name_class"] = name;
  }

  $("#load-show-save-" + actual_class).css("visibility", "hidden");
  $("#modalSaveClass").modal("open");

  //Canviem els directoris per defecte
  let train_dir = dades_dataset["train_dir"] + "/" + name;
  let val_dir = dades_dataset["validation_dir"] + "/" + name;
  dades_dataset.classes.info[actual_class]["train_dir"] = train_dir;
  dades_dataset.classes.info[actual_class]["validation_dir"] = val_dir;

  fs.readdir(train_dir, (err, files) => {
    dades_dataset["classes"]["info"][actual_class]["num_train"] = files.length;
  });
  fs.readdir(val_dir, (err, files) => {
    dades_dataset["classes"]["info"][actual_class]["num_validation"] = files.length;
  });
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per seleccionar imatges de validació///////////////////
/*
 *Per a copiar imatges d'un directori a altre ho fem mitjançan crides asincrones "fs-extra"
 *Per quedarnos amb el nom del fitxer ha sigut necesari importar "path"
 *Aquesta funcio copia multiple fitxers
 *Es necesari saber a quina clase corresponen les imatges "actual_class"
 */

$(document).on('click', "#load-set-validation-images", function() {
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
      console.log(value + "---->" + dades_dataset["validation_dir"] + "/" + name_class);
      fsr.copy(value, dades_dataset["validation_dir"] + "/" + name_class + "/" + path.basename(value))
        .then(() => count_img(dades_dataset["validation_dir"] + "/" + name_class, "#load-num-validation-img" + actual_class, "Number of validation images: "))
        .then(() => show_img(dades_dataset["validation_dir"] + "/", "validation", path.basename(value)))
        .catch(err => console.error(err))
    })
    //Cridem a la funció per a que carrege les imatges
    /*if (files_count == files.length) {
      show_img(dades_dataset["train_dir"] + "/")
    }*/
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

$(document).on('click', "#load-delete-train-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files.forEach(function(value) {
      fsr.remove(value)
        .then(() => count_img(dades_dataset["train_dir"] + "/" + name_class, "#load-num-train-img" + actual_class, "Number of train images: "))
        .then(() => show_img(dades_dataset["train_dir"] + "/", "train", ""))
        .catch(err => console.error(err))
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
$(document).on('click', "#load-delete-validation-images", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (files) {
    files.forEach(function(value) {
      fsr.remove(value)
        .then(() => count_img(dades_dataset["validation_dir"] + "/" + name_class, "#load-num-validation-img" + actual_class, "Number of validation images: "))
        .then(() => show_img(dades_dataset["validation_dir"] + "/", "validation", ""))
        .catch(err => console.error(err))
    });
  }
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per saber la clase actual//////////////////////////////
$(document).on('click', "#load-tab-class", function() {
  actual_class = $(this).attr('value')
  element_tab = $(this)
  name_class = dades_dataset["classes"]["info"][actual_class]["name_class"];
  count_img(dades_dataset["train_dir"] + "/" + name_class, "#load-num-train-img" + actual_class, "Number of train images: ")
  count_img(dades_dataset["validation_dir"] + "/" + name_class, "#load-num-validation-img" + actual_class, "Number of validation images: ")
  //mostrar IMATGES
  show_img(dades_dataset["train_dir"] + "/", "train", "")
  show_img(dades_dataset["validation_dir"] + "/", "validation", "")
})
////////////////////////////////////////////////////////////////////////////////

/////////Event per seleccionar ruta on guardar les dades del dataset////////////
let directoriSave = document.querySelector('#save-dataset-load')
directoriSave.addEventListener('click', () => {
  name = document.getElementById("load_dataset_name").value;
  dades_dataset.name = name;
  //Guardem la configuració del dataset
  fs.writeFile(name, JSON.stringify(dades_dataset), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    //Guardem la ruta i el nom del dataset
    console.log("File has been created");
  });
})
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Eliminar clase////////////////////////////////////
/*Falta posar que elimine les dades de de la clase*/
$(document).on('click', "#load-delete-class", function() {
  console.log("#load-tab" + actual_class)
  element_tab.remove()
  $("#" + actual_class).remove()
  //eliminem dades i modifiquem JSON
  dades_dataset.classes.num_classes = dades_dataset.classes.num_classes - 1
  delete dades_dataset.classes.info[actual_class]
  //eliminem directoris
  fs.rmdirSync(dades_dataset["train_dir"] + '/' + name_class);
  fs.rmdirSync(dades_dataset["validation_dir"] + '/' + name_class);
})
//////////////////////////////////////////////////////////////////////////////

//////////////////////////Contar Fitxers////////////////////////////////////////
/*
 *rep el tipus per saber en quin lloc ficar el resultat
 *
 */
function count_img(directory, type, cad) {
  //contar arxius en subdirectoris, de forma sincrona per actualizar valors
  let files = recursive(directory);
  console.log(directory + " " + type + " " + cad);
  $(type).html(cad + " " + files.length);
  //document.getElementById(type).value = files.length

}
////////////////////////////Carregar Imatges////////////////////////////////////
/*
 * Nom de la carpeta on es guarden les imatges
 * arg1=> directori
 * arg3=> array amb imatges
 * arg2=> tipo train | v
 */
function show_img(directory, type, images) {
  let obj_classes = dades_dataset["classes"]["info"]
  console.log("clase actual" + actual_class)
  let dir = obj_classes[actual_class]["name_class"] + "/"
  var gallery = $('<div id="gallery-load' + actual_class + "-" + type + '"> </div>')

  if (images == "") {
    //carregem totes les imatges del directori
    console.log("TIPUS-" + type)
    $("#gallery-load-" + actual_class + "-" + type).empty()
    gallery.appendTo("#gallery-load-" + actual_class + "-" + type)
    console.log("variable dir=>" + dir)
    console.log("variable directory=>" + directory)

    let files = recursive(directory + dir);
    files.forEach(function(value) {
      $('<a href="' + value + '"><img id="img-thumb" src="' + value + '"/></a>').appendTo("#gallery-load" + actual_class + "-" + type)
      console.log(value)
    })
    gallery.lightGallery();
  } else {
    //sino sol carregem una imatge
    $('<a href="' + directory + dir + images + '"><img id="img-thumb" src="' + directory + dir + images + '"/></a>').appendTo("#gallery-load" + actual_class + "-" + type)
    gallery.lightGallery();
    console.log(directory + dir + images);
  }
  //$(type).html(cad + " " + files.length);
  //document.getElementById(type).value = files.length

}
////////////////////////////////////////////////////////////////////////////////
