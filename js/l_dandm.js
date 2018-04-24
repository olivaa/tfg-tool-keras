/*Arxiu per carregar tots els datasets guardats y els models*/
/*Exemple de fitxer
{
  "datasets":{
    "Cats_vs_Dogs":{
      "dir_dataset":"./home/Desktop/dataset/dataset-a.json"
    }
  },
  "models":{
    "vgg16":{
      "dir_model":""
    }
  }
}
*/
var fs = require('fs');
var fsr = require('fs-extra');
const path = require('path');
//per contar arxius en subdirectoris
var recursive = require("recursive-readdir");


///////////////////Dependencias per accedir a l'explorador d'arxius/////////////
const {
  remote
} = require('electron');
const {
  app,
  dialog
} = require('electron').remote;
////////////////////////////////////////////////////////////////////////////////

///////////////////Variables per començar l¡entrenament/////////////////////////
let train_dir = ""
let validation_dir = ""
let model = ""
let dades_dataset = ""
let dades_model = ""
////////////////////////////////////////////////////////////////////////////////


var obj = require('../json/datasets_models.json');
datasets = obj["datasets"]
models = obj["models"]

d = Object.keys(datasets)
m = Object.keys(models)

m.forEach(function(value) {
  var x = document.getElementById("select-model");
  var option = document.createElement("option");
  option.text = value;
  option.value = dataset[value]
  x.add(option);
  console.log(value);
});

/*d.forEach(function(value) {
  var x = document.getElementById("select-dataset");
  var option = document.createElement("option");
  option.text = value;
  option.value = dataset[value]
  x.add(option);
  console.log(value);
});*/

/*
 *En aquesta funció agafem el valor del select corresponent als datasets
 *quan el usuari interactua amb el component
 */
/*$("#select-dataset").change(function() {
  $("#select-dataset option:selected").each(function() {
    let str=""
    str += $(this).text() + " ";
    alert(str);
  });

});
*/


/*
 *En aquesta funció agafem el valor del select corresponent als models
 *quan el usuari interactua amb el component
 */
$("#select-model").change(function() {
  $("#select-model option:selected").each(function() {
    let str = ""
    str += $(this).text() + " ";
    alert(str);
  });
});


///////////////////Event per seleccionar ruta dataset///////////////
let directoriDataset = document.querySelector('#select-dataset')
directoriDataset.addEventListener('click', () => {
  const file = dialog.showOpenDialog({
    properties: ['openFile'],
  });
  if (file) {
    directoriDataset.value = file[0]
    dades_dataset = JSON.parse(fs.readFileSync(file[0], 'utf8'));
    train_dir = dades_dataset["train_dir"]
    validation_dir = dades_dataset["validation_dir"];
    //contar arxius en subdirectoris
    recursive(train_dir, function(err, files){
      console.log(files.length);
    });
    recursive(validation_dir,function(err, files){
      console.log(files.length);
    });
    //dades_dataset["train_dir"] = directory[0] + '/train'
  }
})
///////////////////////////////////////////////////////////////////////////////
