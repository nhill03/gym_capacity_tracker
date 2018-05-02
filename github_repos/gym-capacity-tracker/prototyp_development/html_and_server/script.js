$( document ).ready(function() {

  $('#day').click(function() {
    show_day();
  })
  $('#week').click(function() {
    show_week();
  })

  $('#month').click(function() {
    show_month();
  })

  $('#year').click(function() {
    show_year();
  })


});

anychart.onDocumentReady(function() {
   anychart.theme(anychart.themes.darkBlue);
   var data;
   var chart = anychart.column();;
   show_current();
   show_day();

});

function show_people() {

  personsData = {
    datasets: [{
        data: [57]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'People'
        // 'Yellow',
        // 'Blue'
    ]
  };


  var ctx = $("#people-graph");
  var pplChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [10, 20, 30]
      }],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: [
      'Red',
      'Yellow',
      'Blue'
      ]
    }

  })
};


 function show_current()
 {
   // document.getElementById("currentCapacity").innerHTML = "Current Capacity";
 }

 function show_day()
 {
   document.getElementById("graph").innerHTML = "";
	 // set the data
  data = {
    header: ["Name", "People"],
    rows: [
    ["7AM", 50],
    ["8AM", 50],
    ["9AM", 50],
    ["10AM", 50],
    ["11AM", 50],
    ["12AM", 50],
    ["1PM", 50],
    ["2PM", 50],
    ["3PM", 50],
    ["4PM", 50],
    ["5PM", 50],
    ["6PM", 50],
    ["7PM", 50],
    ["8PM", 50],
    ["9PM", 50],
    ["10PM", 50],
    ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // draw
        chart.container("graph");
        chart.draw();
      }

      function show_week()
      {
       document.getElementById("graph").innerHTML = "";
	 // set the data
  data = {
    header: ["Name", "People"],
    rows: [
    ["Mon", 50],
    ["Tue", 50],
    ["Wed", 50],
    ["Thu", 50],
    ["Fri", 50],
    ["Sat", 50],
    ["Sun", 50]
    ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // draw
        chart.container("graph");
        chart.draw();
      }

      function show_month()
      {
       document.getElementById("graph").innerHTML = "";
	 // set the data
  data = {
    header: ["Name", "People"],
    rows: [
    ["Jan", 50],
    ["Feb", 50],
    ["Mar", 50],
    ["Apr", 50],
    ["May", 50],
    ["Jun", 50],
    ["Jul", 50],
    ["Aug", 50],
    ["Sep", 50],
    ["Oct", 50],
    ["Nov", 50],
    ["Dec", 50],
    ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // draw
        chart.container("graph");
        chart.draw();
      }

      function show_year()
      {
       document.getElementById("graph").innerHTML = "";
	 // set the data
  data = {
   header: ["Name", "People"],
   rows: [
   ["2018", 50],
   ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // draw
        chart.container("graph");
        chart.draw();
      }