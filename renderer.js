//////////////////////////////configuracaió zerorpc/////////////////////////////
const zerorpc = require("zerorpc")
let client = new zerorpc.Client()
////////////////////////////////////////////////////////////////////////////////

///////////////////////configuració zmq////////////////////////////////////
/**
* Enviem un misatge per establir conexion que despres replicarem cada vegada
* que recibim un mistage del servidor
* Quan recibim un missate de moment sol agafem les dades del entrenamiento
* de acc i loss pero deuriem crear una estructura per tractar el tipus de dades
*/
let zmq = require('zeromq')
  ,requester= zmq.socket('req');
var router='tcp://127.0.0.1:4244';
requester.identity="usuari1";
requester.connect(router);
requester.send("Establint conexió");
console.log('Conexió realitzada');
requester.on('message', function (msg) {
      //var message = msg.toString();
      //console.log('Mensaje', message);
      var obj_chart_data = JSON.parse(message);
      console.log('Mensaje', obj_chart_data.accuracy);
      console.log('Mensaje', obj_chart_data.loss);
      epochs_chart+=1
      var lab_epoch='iter'+epochs_chart
      addLabel(chart,lab_epoch);
      addData(chart,obj_chart_data.accuracy,"Accuracy")
      addData(chart,obj_chart_data.loss,"Loss")
      requester.send("disponible");
});
////////////////////////////////////////////////////////////////////////////

///////////////////Dependencias per accedir a l'explorador d'arxius/////////////
const {remote} = require('electron');
const {app, dialog} = require('electron').remote;
////////////////////////////////////////////////////////////////////////////////

///////////////////Dades entrenament////////////////////////////////////////////
var data={
  rutaEntrenament:"",
  rutaTest:"",
  epochs:"",
  arquitectura:"",
  rutaScript:""
};
var epochs_chart=0;
var data_charts_acc=[]
var data_charts_loss=[]
var labels_chart=["iter1","iter2","iter3","iter4","iter5","iter6","iter7","iter8"]
////////////////////////////////////////////////////////////////////////////////

//////////////////////////Conexió API Python////////////////////////////////////
client.connect("tcp://127.0.0.1:4242")
client.invoke("echo", "server ready", (error, res) => {
  if(error || res !== 'server ready') {
    console.error(error)
  } else {
    console.log("server is ready")
  }
})
////////////////////////////////////////////////////////////////////////////////

let texto = document.querySelector('#texto')
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

///////////////////Event per llançar tasca d'entrenament////////////////////////
let entreno = document.querySelector('#entreno')
entreno.addEventListener('click', () => {
  client.invoke("entrenar",data, (error, res) => {
    if(error) {
      console.error(error)
    } else {
      console.log("alla vá")
      data_charts=[]
      resultado_texto.textContent = res
    }
  })
})
////////////////////////////////////////////////////////////////////////////////

///////////////////Event per obrir directoris y multiples fitxers///////////////
/*let directoris = document.querySelector('#directori')
directoris.addEventListener('click', () => {
  const directory = dialog.showOpenDialog({
        properties: ['openFile','multiSelections'],
    });
    if (directory) {
        console.log(directory)
    }
})*/
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per seleccionar ruta entrenamiento///////////////
let textoTrain = document.querySelector('#train')
let directoriTrain = document.querySelector('#directori-train')
directoriTrain.addEventListener('click', () => {
  const directory = dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    if (directory) {
        textoTrain.value = directory[0]
        data["rutaEntrenament"]=directory[0]
        console.log(directory[0])
    }
})
////////////////////////////////////////////////////////////////////////////////


///////////////////Event per seleccionar ruta entrenamiento///////////////
let textoTest = document.querySelector('#test')
let directoriTest = document.querySelector('#directori-test')
directoriTest.addEventListener('click', () => {
  const directory = dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    if (directory) {
        textoTest.value = directory[0]
        data["rutaTest"]=directory[0]
        console.log(directory)

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
var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: labels_chart,
        datasets: [{
            label: "Accuracy",
            //backgroundColor: 'rgb(106, 162, 119)',
            borderColor: 'rgb(106, 162, 119)',
            fill:false,
            data: data_charts_acc,
        },
        {
            label: "Loss",
            //backgroundColor: 'rgb(186, 102, 189)',
            borderColor: 'rgb(186, 102, 189)',
            fill:false,
            data: data_charts_loss,
        }]
    },

    // Configuration options go here
    options: {}
});
////////////////////////////////////////////////////////////////////////////////


/////////////Actualització de grafiques(datasets y labels)//////////////////////
function addData(chart, data,dset) {
    chart.data.datasets.forEach((dataset) => {
        if(dataset.label===dset){
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
texto.dispatchEvent(new Event('input'))
