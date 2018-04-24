  $(document).ready(function() {
    $("#lightgallery").lightGallery({
      thumbnail: true,
      dynamicEl: [{
        "src": 'pycalc/nnetworks/data/train/train6051/3a2abc3f0d53858b.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }, {
        "src": '../static/img/1.jpg'
      }]
    });
  });


  $('#crop-select').CropSelectJs({
    imageSrc: "pycalc/nnetworks/data/train/train6051/3a0ceb586a530451.jpg"
  });


  $(document).ready(function() {
    $("#train-button").click(function() {
      $('#dataset').hide();
      $('#gallery-train').hide();
      $('#train-sets').show();
      $('#load-dataset').hide();
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
      console.log("entra al boto 2");
    });
  });
  $(document).ready(function() {
    $("#load-dataset-button").click(function() {
      $('#train-sets').hide();
      $('#gallery-train').hide();
      $('#dataset').hide();
      $('#load-dataset').show();
      console.log("entra al boto 2");
    });
  });

  $(document).ready(function() {
    $("#model-button").click(function() {
      $('#dataset').hide();
    });
  });
  $(document).ready(function() {
    $("#statistic-button").click(function() {
      $('#dataset').hide();
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
