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

/*
 *En aquesta funció agafem el valor del select corresponent als models
 *quan el usuari interactua amb el component
 */
$("#options-model").change(function() {
  $("#options-model option:selected").each(function() {
    let str = ""
    str += $(this).text();
    if(str=="Models Keras"){
      $('#api-keras').show();
      $('#api-keras-learning').show();
    }else if (str=="New Model") {
      $('#api-keras').hide();
      $('#api-keras-learning').hide();
    }else{
      $('#api-keras').hide();
      $('#api-keras-learning').hide();
    }
  });
});
