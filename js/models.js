var fs = require('fs');
var fsr = require('fs-extra');
const path = require('path');
//per contar arxius en subdirectoris
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

var obj = require('../json/datasets_models.json');
var obj_model_fine = require('../pycalc/nnetworks/models/models_json/fine-tune.json');
var obj_model_transfer = require('../pycalc/nnetworks/models/models_json/transfer.json');
var obj_model_your = require('../pycalc/nnetworks/models/models_json/your-model.json');

//////////Variables generals//////
let model = ""
let type_model = ""
let name_fully = ""
let optimizer = ""

/////////////////////////////////

models = obj["pre-models"]

m = Object.keys(models)
console.log(m)

m.forEach(function(value) {
  var x = document.getElementById("type-model");
  var option = document.createElement("option");
  option.text = value;
  option.value = dataset[value]
  x.add(option);
  console.log(value);
});

/////////////////////////////Carregar models////////////////////////////////////
/*
 *En aquesta funció agafem el valor del select corresponent als models
 *quan el usuari interactua amb el component
 */
$("#options-model").change(function() {
  $("#options-model option:selected").each(function() {
    let str = ""
    str += $(this).text();
    if (str == "Models Keras") {
      $('#api-keras').show();
      $('#api-keras-learning').show();
    } else if (str == "New Model") {
      $('#api-keras').hide();
      $('#api-keras-learning').hide();
    } else {
      $('#api-keras').hide();
      $('#api-keras-learning').hide();
    }
  });
});
///////////////////////////////////////////////////////////////////////////////

/////////////////////////////Model seleccionat//////////////////////////////////
/*
 *Seleccionen una arquitectura per a la red i la guardem en els objectes
 */
$("#type-model").change(function() {
  $("#type-model option:selected").each(function() {
    obj_model_fine["model"] = $(this).text();
    obj_model_transfer["model"] = $(this).text();
  });
});
///////////////////////////////////////////////////////////////////////////////

/////////////////////////////Model seleccionat//////////////////////////////////
/*
 *Seleccionem el tipus d'aprenentage del model Fine-Tune o Transfer Learning
 */
$("#type-learn").change(function() {
  $("#type-learn option:selected").each(function() {
    type_model = $(this).text();
    //obj_model_transfer["model"]= $(this).text();
  });
});
///////////////////////////////////////////////////////////////////////////////

////////////////////////Carregar de functio d'error/////////////////////////////////
/*
 *Carregem una funcio de perdua i la guardem en el objecte json
 */
$("#select-loss-fun").change(function() {
  $("#select-loss-fun option:selected").each(function() {
    obj_model_fine["loss_function"] = $(this).text();
    obj_model_transfer["loss_function"] = $(this).text();
  });
});
////////////////////////////////////////////////////////////////////////////////

////////////////////////Carregar tipus d'optimizador////////////////////////////
/*
 *Selección d'un optimizador i la crrega dels seus parametres
 */
$("#select-opt-fine").change(function() {
  $("#select-opt-fine option:selected").each(function() {
    optimizer = $(this).text();
    $('#param-opt-fine').empty()
    let parameters = obj_model_fine[optimizer]
    obj_model_fine["select_optimizer"] = optimizer;
    opt_parameters(parameters, optimizer);
  });
});
////////////////////////////////////////////////////////////////////////////////

///////////////Funció carregar parametres optimizador///////////////////////////
function opt_parameters(parameters, opt) {
  for (var k in parameters) {
    if (parameters.hasOwnProperty(k)) {
      if(k=="nesterov"|| k=="amsgrad"){
        $('<div class="col s1" style="margin-top:1%;margin-left:2%"> <span class="white-text">' + k + '</span> </div> <div class="col s1"> <input type="number" id="' + k + "-" + opt + '" class="basictxt white-text" placeholder="None"  min="0" max="1"></div>').appendTo("#param-opt-fine");
      }else{
        $('<div class="col s1" style="margin-top:1%;margin-left:2%"> <span class="white-text">' + k + '</span> </div> <div class="col s1"> <input type="number" id="' + k + "-" + opt + '" class="basictxt white-text" placeholder="None"></div>').appendTo("#param-opt-fine");
      }
    }
  }
}
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Guardar parametres/////////////////////////////////
/*Agafem tots el valor que ha introduit el usuario en un optimizador*/
function complete_parameters(parameters) {
  for (var k in parameters) {
    if (parameters.hasOwnProperty(k)) {
      opt_val = document.getElementById(k + "-" + optimizer).value;
      if (opt_val == "") {
        opt_val = 0;
      }
      obj_model_fine[optimizer][k] = opt_val;
    }
  }
}
////////////////////////////////////////////////////////////////////////////////

///////////////////////Seleccionar fully-connected//////////////////////////////
/*
 *Per a copiar l'arxiu del usuario amb capes conectades
 */
$(document).on('click', "#select-file-fine", function() {
  const files = dialog.showOpenDialog({
    properties: ['openFile'],
  });
  if (files) {
    files_count = 0;
    files.forEach(function(value) {
      console.log(__dirname + path.basename(value))
      name_fully = path.basename(value).replace(".py", "");
      obj_model_fine["name-fully"] = name_fully;
      obj_model_transfer["name-fully"] = name_fully;
      fsr.copy(value, __dirname + "/../pycalc/nnetworks/models/topLayer/" + path.basename(value))
        .catch(err => console.error(err))
    })
  }
})
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Guardar-model//////////////////////////////////////
let directoriSave = document.querySelector('#save-model-json')
let textoSave = document.querySelector('#directori-model')
directoriSave.addEventListener('click', () => {
  let name = document.getElementById("model_name").value;
  let data_model = {}
  if (type_model == "Fine-Tune") {
    obj_model_fine["name"] = name
    complete_parameters(obj_model_fine[optimizer])
    obj_model_fine["input_shape_x"] = document.getElementById("inp_shape_x").value;
    obj_model_fine["input_shape_y"] = document.getElementById("inp_shape_y").value;
    obj_model_fine["freeze_layers"] = document.getElementById("freeze_layers").value;
    data_model = obj_model_fine
    console.log("entra")
  } else if (type_model == "Transfer Learning") {
    obj_model_transfer["name"] = name
    obj_model_transfer["input_shape_x"] = document.getElementById("inp_shape_x").value;
    obj_model_transfer["input_shape_y"] = document.getElementById("inp_shape_y").value;
  } else {
    obj_model_your["name"] = name
  }
  console.log(data_model)
  const directory = dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (directory) {
    textoSave.value = directory[0]
    //Guardem la configuració del dataset
    fs.writeFile(directory[0] + "/" + name + ".json", JSON.stringify(data_model), (err) => {
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
