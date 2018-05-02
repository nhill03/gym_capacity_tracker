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
   anychart.theme(anychart.themes.monochrome);
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
    ["7AM", number7],
    ["8AM", number8],
    ["9AM", number9],
    ["10AM", number10],
    ["11AM", number11],
    ["12AM", number12],
    ["1PM", number13],
    ["2PM", number14],
    ["3PM", number15],
    ["4PM", number16],
    ["5PM", number17],
    ["6PM", number18],
    ["7PM", number19],
    ["8PM", number20],
    ["9PM", number21],
    ["10PM", number22],
    ]};

  
        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // Calculate tick interval based off max 
        var avg = 0;
        for (i=0; i < data.rows.length; i++) {
          avg += data.rows[i][1];
        }
        avg = avg / 16;
        avg *= 5;
        avg += 10;
        Math.round(avg);

        chart.yScale().ticks().interval(avg);

        // display minor ticks
        // chart.yAxis().minorTicks().enabled(true);
        chart.yScale().minimum(0);

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
    ["Mon", week1],
    ["Tue", week2],
    ["Wed", week3],
    ["Thu", week4],
    ["Fri", week5],
    ["Sat", week6],
    ["Sun", week7]
    ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // setting ticks and minor ticks
        chart.yScale().ticks().interval(250);

        // display minor ticks
        chart.yAxis().minorTicks().enabled(true);
        chart.yScale().minimum(0);

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
    ["Jan", month1],
    ["Feb", month2],
    ["Mar", month3],
    ["Apr", month4],
    ["May", month5],
    ["Jun", month6],
    ["Jul", month7],
    ["Aug", month8],
    ["Sep", month9],
    ["Oct", month10],
    ["Nov", month11],
    ["Dec", month12],
    ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");
        
        // setting ticks and minor ticks
        chart.yScale().ticks().interval(1000);
        chart.yScale().minimum(0);
        // display minor ticks
        // chart.yAxis().minorTicks().enabled(true);

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
   ["2018", year1],
   ]};

        // create the chart
        chart = anychart.column();

        // add the data
        chart.data(data);

        // set the chart title
        chart.title("Number of people in gym");

        // setting ticks and minor ticks
        chart.yScale().ticks().interval(1000);
        chart.yScale().minimum(0);
        // display minor ticks
        // chart.yAxis().minorTicks().enabled(true);

        // draw
        chart.container("graph");
        chart.draw();
      }