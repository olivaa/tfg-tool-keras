$(document).ready(function() {
  $('#api-keras').hide();
  $('#api-keras-learning').hide();
});
$(document).ready(function() {
  $("#train-button").click(function() {
    $('#dataset').hide();
    $('#gallery-train').hide();
    $('#train-sets').show();
    $('#load-dataset').hide();
    $('#models').hide();
    $('#api-keras').hide();
    console.log("entra al boto 1");
  });
});

$(document).ready(function() {
  $("#dataset-button").click(function() {
    //  $('#train').hide();
    $('#new-dataset-button').toggle();
    $('#load-dataset-button').toggle();
    //  $('#gallery-train').show();
    //  $('#dataset').show();
    console.log("entra al boto 2");
  });
});

$(document).ready(function() {
  $("#new-dataset-button").click(function() {
    $('#train-sets').hide();
    $('#gallery-train').show();
    $('#dataset').show();
    $('#load-dataset').hide();
    $('#models').hide();
    console.log("entra al boto 2");
  });
});
$(document).ready(function() {
  $("#load-dataset-button").click(function() {
    $('#train-sets').hide();
    $('#gallery-train').hide();
    $('#dataset').hide();
    $('#load-dataset').show();
    $('#models').hide();
    console.log("entra al boto 2");
  });
});

$(document).ready(function() {
  $("#model-button").click(function() {
    $('#train-sets').hide();
    $('#gallery-train').hide();
    $('#dataset').hide();
    $('#load-dataset').hide();
    $('#models').show();
  });
});
$(document).ready(function() {
  $("#statistic-button").click(function() {
    $('#train-sets').hide();
    $('#gallery-train').hide();
    $('#dataset').hide();
    $('#load-dataset').hide();
    $('#models').hide();
  });
});

$(document).ready(function() {
  $('.tabs').tabs();
});
$(document).ready(function() {
  $('.modal').modal();
});
$(document).ready(function() {
  $('select').formSelect();
});
