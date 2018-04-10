//////////////////////////////configuracaió zerorpc/////////////////////////////
const zerorpc = require("zerorpc")
let client = new zerorpc.Client()
var fs = require('fs');
var fsr = require('fs-extra');
const path = require('path');



////////////////////////////////////////////////////////////////////////////////

///////////////////////configuració zmq////////////////////////////////////
/**
 * Enviem un misatge per establir conexion que despres replicarem cada vegada
 * que recibim un mistage del servidor
 * Quan recibim un missate de moment sol agafem les dades del entrenamiento
 * de acc i loss pero deuriem crear una estructura per tractar el tipus de dades
 */
let zmq = require('zeromq'),
  requester = zmq.socket('req');
var router = 'tcp://127.0.0.1:4244';
requester.identity = "usuari1";
requester.connect(router);
requester.send("Establint conexió");
console.log('Conexió realitzada');
requester.on('message', function(msg) {
  var message = msg.toString();
  //console.log('Mensaje', message);
  var obj_chart_data = JSON.parse(message);
  console.log('Mensaje', obj_chart_data.accuracy);
  console.log('Mensaje', obj_chart_data.loss);
  epochs_chart += 1
  var lab_epoch = 'iter' + epochs_chart
  addLabel(train_chart, lab_epoch);
  addData(train_chart, obj_chart_data.accuracy, "Accuracy")
  addData(train_chart, obj_chart_data.loss, "Loss")

  addLabel(validation_chart, lab_epoch);
  addData(validation_chart, obj_chart_data.val_acc, "Validation Accuracy")
  addData(validation_chart, obj_chart_data.val_loss, "Validation Loss")
  requester.send("disponible");
});
////////////////////////////////////////////////////////////////////////////

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
    info: []
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

///////////////////Dades entrenament////////////////////////////////////////////
var data = {
  rutaEntrenament: "",
  rutaTest: "",
  epochs: "",
  arquitectura: "",
  rutaScript: ""
};
var epochs_chart = 0;
var data_charts_acc = []
var data_charts_loss = []
var labels_chart = ["iter1", "iter2", "iter3", "iter4", "iter5", "iter6", "iter7", "iter8"]
var validation_epochs_chart = 0;
var validation_data_charts_acc = []
var validation_data_charts_loss = []
var validation_labels_chart = ["iter1", "iter2", "iter3", "iter4", "iter5", "iter6", "iter7", "iter8"]
////////////////////////////////////////////////////////////////////////////////

//////////////////////////Conexió API Python////////////////////////////////////
client.connect("tcp://127.0.0.1:4242")
client.invoke("echo", "server ready", (error, res) => {
  if (error || res !== 'server ready') {
    console.error(error)
  } else {
    console.log("server is ready")
  }
})
////////////////////////////////////////////////////////////////////////////////

////////////////////////text hola 2////////////////////////////////////////////
/*let texto = document.querySelector('#texto')
let resultado_texto = document.querySelector('#resultado_texto')
texto.addEventListener('input', () => {
  client.invoke("echo", texto.value, (error, res) => {
    if(error) {
      console.error(error)
    } else {
      resultado_texto.textContent = res
    }
  })
})
*/
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per llançar tasca d'entrenament////////////////////////
let entreno = document.querySelector('#entreno')
entreno.addEventListener('click', () => {
  client.invoke("entrenar", data, (error, res) => {
    if (error) {
      console.error(error)
    } else {
      console.log("alla vá")
      train_chart.reset();
      data_charts = []
      //resultado_texto.textContent = res
    }
  })
})
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
      $('<div class="row" id="info-data-' + id_class + i + '"> <div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Train info.</span> <p>Number of train images: 400 </p><p>Directory: ' + dades_dataset["train_dir"] + '/' + id_class + i + '</p></div></div></div> ').appendTo("#" + id_class + i);
      $('<div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Validation info.</span> <p>Number of validation images: 400</p> <p>Directory: ' + dades_dataset["validation_dir"] + '/' + id_class + i + '</p> </div> </div> </div> </div>').appendTo("#info-data-" + id_class + i);
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
      $('<div class="row" id="info-data-' + id_class + i + '"> <div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Train info.</span> <p>Number of train images: 400 </p><p>Directory: ' + dades_dataset["train_dir"] + '/' + id_class + i + '</p></div></div></div> ').appendTo("#" + id_class + i);
      $('<div class="col s12 m6"> <div class="card grey darken-3"><div class="card-content white-text"> <span class="card-title">Validation info.</span> <p>Number of validation images: 400</p> <p>Directory: ' + dades_dataset["validation_dir"] + '/' + id_class + i + '</p> </div> </div> </div> </div>').appendTo("#info-data-" + id_class + i);
      $('<div class="row"> <div class="col s3 offset-s6"><div class="btn waves-effect waves-light green lighten-2" id="set-class" style="width: 100%;" value="' + id_class + i + '"><i class="material-icons right">check</i><span>Save Class</span> </div></div><div class="col s3"><div class="btn waves-effect waves-light red lighten-2" id="set-class" style="width: 100%;"><i class="material-icons right">clear</i><span>Delete Class</span> </div><div></div>').appendTo("#" + id_class + i);
      $("</form>");
    }
  }
})
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per guadar DataSet//////////////////
$(document).on('click', "#save-dataset", function() {
  //console.log(dades_dataset)
  console.log("caca");
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
      console.log(value + "---->" + dades_dataset["train_dir"] + "/" + actual_class);
      fsr.copy(value, dades_dataset["train_dir"] + "/" + actual_class + "/" + path.basename(value))
        .then(() => console.log('success!'))
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
        .then(() => console.log('success!'))
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
  let train_dir = dades_dataset["train_dir"] + "/" + actual_class;
  let val_dir = dades_dataset["validation_dir"] + "/" + actual_class;

  console.log(dades_dataset.classes.info[actual_class]);

  fs.readdirSync(train_dir, (err, files) => {
    dades_dataset["classes"]["info"][actual_class]["data"]["num_train"] = files.length;
  });
  fs.readdirSync(val_dir, (err, files) => {
    dades_dataset["classes"]["info"][actual_class]["data"]["num_validation"] = files.length;
  });

  console.log(JSON.stringify(dades_dataset));


})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per saber la clase actual//////////////////////////////
$(document).on('click', "#tab-class", function() {
  actual_class = $(this).attr('value');
  let obj_class = {
      name_class: "",
      train_dir: dades_dataset["train_dir"] + "/" + actual_class,
      validation_dir: dades_dataset["validation_dir"] + "/" + actual_class,
      num_train: 0,
      num_validation: 0
    }
dades_dataset.classes.info[actual_class]=obj_class;
//dades_dataset["classes"]["info"].push(obj_class);
console.log(JSON.stringify(dades_dataset));
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


/////////////////////Comunicacio entre client-api-router-client/////////////////
let comunicacio = document.querySelector('#comunicacio')
comunicacio.addEventListener('click', () => {
  console.log(data);
  client.invoke("streaming_range");
})
////////////////////////////////////////////////////////////////////////////////


////////////////////Creacio de grafiques////////////////////////////////////////
var acc_loss = document.getElementById('train_acc_loss').getContext('2d');
var train_chart = new Chart(acc_loss, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
    labels: labels_chart,
    datasets: [{
        label: "Accuracy",
        //backgroundColor: 'rgb(106, 162, 119)',
        borderColor: 'rgb(106, 162, 119)',
        fill: false,
        data: data_charts_acc,
      },
      {
        label: "Loss",
        //backgroundColor: 'rgb(186, 102, 189)',
        borderColor: 'rgb(186, 102, 189)',
        fill: false,
        data: data_charts_loss,
      }
    ]
  },
  // Configuration options go here
  options: {}
});
var valacc_valloss = document.getElementById('validation_acc_loss').getContext('2d');
var validation_chart = new Chart(valacc_valloss, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
    labels: validation_labels_chart,
    datasets: [{
        label: "Validation Accuracy",
        //backgroundColor: 'rgb(106, 162, 119)',
        borderColor: 'rgb(106, 162, 119)',
        fill: false,
        data: validation_data_charts_acc,
      },
      {
        label: "Validation Loss",
        //backgroundColor: 'rgb(186, 102, 189)',
        borderColor: 'rgb(186, 102, 189)',
        fill: false,
        data: validation_data_charts_loss,
      }
    ]
  },

  // Configuration options go here
  options: {
    legend: {
      labels: {
        fontColor: '#ffffff'
      }
    }
  }
});
////////////////////////////////////////////////////////////////////////////////


/////////////Actualització de grafiques(datasets y labels)//////////////////////
function addData(chart, data, dset) {

  chart.data.datasets.forEach((dataset) => {
    if (dataset.label === dset) {
      dataset.data.push(data);
    }
  });
  chart.update();
}

function addLabel(chart, label) {
  chart.data.labels.push(label);
  chart.update();
}
////////////////////////////////////////////////////////////////////////////////



//directoris.dispatchEvent(new Event('button'))
//entreno.dispatchEvent(new Event('click'))
//texto.dispatchEvent(new Event('input'))//hola 2
