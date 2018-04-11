var zmq = require('zeromq');
var router = zmq.socket('router');
var routerpy = zmq.socket('router');

var d = new Date();
var peticio=0;

router.bindSync('tcp://*:4244');
routerpy.bindSync('tcp://*:9001');


router.on('message', function () {
  // get the identity of current worker
  var identity = Array.prototype.slice.call(arguments)[0];
  console.log("rep missatge de client "+identity);
  routerpy.send(['usuari1', '', peticio]);
  peticio++;
});

routerpy.on('message', function (msg) {
  // get the identity of current worker
  var message = msg.toString();
  var identity = Array.prototype.slice.call(arguments)[0];
  console.log("rep missatge de client python "+identity+" "+ Array.prototype.slice.call(arguments)[1]);
  var dades=Array.prototype.slice.call(arguments)[1];
  router.send([identity, '', dades])
});

/*
En aquesta version enviem els missatges al client. Aquests s'envien
quan el client es conecta i envia un misatge. Per aixo cada vegada
que rep a de tornar a replicar per a estar disponible. Amb aço es pot
perdre algun missatge per aixo es deu implementar una cola de missatges
i anar tornant-los per ordre fins que no quede cap.
*/
