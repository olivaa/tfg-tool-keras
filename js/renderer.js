//////////////////////////////configuracaió zerorpc/////////////////////////////
const zerorpc = require("zerorpc")
let client = new zerorpc.Client()
var fs = require('fs');
var fsr = require('fs-extra');
const path = require('path');
var Timer = require('easytimer')
var timer = new Timer()



////////////////////////////////////////////////////////////////////////////////

///////////////////////configuració zmq////////////////////////////////////
/**
 * Enviem un misatge per establir conexion que despres replicarem cada vegada
 * que recibim un mistage del servidor
 * Quan recibim un missate de moment sol agafem les dades del entrenament
 * de acc i loss pero deuriem crear una estructura per tractar el tipus de dades
 *Tambe arreplegem per la iteració en la que es troba l'entrenament per poder parar el temps
 */
let zmq = require('zeromq'),
  requester = zmq.socket('req');
let total_epoch = document.querySelector('#epochs-train')
var router = 'tcp://127.0.0.1:4244';
requester.identity = "usuari1";
requester.connect(router);
requester.send("Establint conexió");
console.log('Conexió realitzada');
requester.on('message', function(msg) {
  let message = msg.toString();
  let obj_chart_data = JSON.parse(message);
  console.log(obj_chart_data);
  console.log('Mensaje', obj_chart_data.accuracy);
  console.log('Mensaje', obj_chart_data.loss);
  let actual_epoch = obj_chart_data.epoch + 1
  epochs_chart += 1
  let lab_epoch = 'iter' + epochs_chart
  addLabel(train_chart, lab_epoch);
  addData(train_chart, obj_chart_data.accuracy, "Accuracy")
  addData(train_chart, obj_chart_data.loss, "Loss")
  addLabel(validation_chart, lab_epoch);
  addData(validation_chart, obj_chart_data.val_acc, "Validation Accuracy")
  addData(validation_chart, obj_chart_data.val_loss, "Validation Loss")
  //Actualizem la iteracio actual
  console.log("total epoques " + total_epoch.value)
  console.log("epoca actual epoques " + actual_epoch)
  console.log(total_epoch.value == actual_epoch)

  $('#actual-epoch').html(actual_epoch + "/" + total_epoch.value);
  //Si es la útlima iteració parem el crono
  if (total_epoch.value-1 == actual_epoch) {
    timer.stop();
  }
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

///////////////////Dades entrenament////////////////////////////////////////////
var data = {
  train_dir: "",
  validation_dir: "",
  model: "",
  epochs: 0,
  batch_size: 0,
  train_img: 0,
  validation_img: 0
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

  let directoriDataset = document.querySelector('#select-dataset')
  let model = ""
  let epochs = document.querySelector('#epochs-train')
  let batch_size = document.querySelector('#batch-train')
  let train_img = document.querySelector('#train-images')
  let validation_img = document.querySelector('#validation-images')
  $("#select-model option:selected").each(function() {
    model += $(this).text();
  });
  //console.log(directoriDataset.value+";"+model.value+";"epochs.value+";"+batch_size.value)
  if (directoriDataset.value !== "" && model.value !== "" && epochs.value !== 0 && batch_size.value !== 0) {

    //model, directoris, epochs, batch_size
    let dades_dataset = JSON.parse(fs.readFileSync(directoriDataset.value, 'utf8'));
    data["train_dir"] = dades_dataset["train_dir"]
    data["validation_dir"] = dades_dataset["validation_dir"];
    data["model"] = model
    data["epochs"] = epochs.value
    data["batch_size"] = batch_size.value
    data["train_img"] = train_img.value
    data["validation_img"] = validation_img.value
    //llança la tasca d'entrenament amb els arguments corresponents a rutes y model
    client.invoke("entrenar", data, (error, res) => {
      if (error) {
        console.error(error)
      } else {
        timer.start()
        console.log("alla vá")
        train_chart.reset();
        data_charts = []
        //resultado_texto.textContent = res
      }
    })
  } else {
    console.log("entra")
    $('#modalError').modal('open');
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

////////////////////////Actualització crono/////////////////////////////////////
timer.addEventListener('secondsUpdated', function(e) {
  $('#crono').html(timer.getTimeValues().toString());
});
////////////////////////////////////////////////////////////////////////////////


//directoris.dispatchEvent(new Event('button'))
//entreno.dispatchEvent(new Event('click'))
//texto.dispatchEvent(new Event('input'))//hola 2
