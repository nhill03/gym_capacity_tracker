/*
* This algorithm was inspired by the examples in fivdi's
* pigpio GitHub repository.
*/

// import regression library for analyzing movement
var regression = require('regression');

// configure mongodb
var mongoURI = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoURI, function(err, dbConnection) {
	db = dbConnection;
});

// trigger connected to RX, echo connected to PWM
var Gpio = require('pigpio').Gpio,
  trigger = new Gpio(11, {mode: Gpio.OUTPUT}),
  echo = new Gpio(8, {mode: Gpio.INPUT, alert: true});

// # of microseconds for sound to travel 1cm at 20* C
var MICROSECONDS_PER_CM = 1e6/34321;

trigger.digitalWrite(0); // Make sure trigger starts low

// empty arrays for storing and analyzing PWM data 
var potentialArr = [];
var checkMoveArr = [];
var dataPoint = [];
var totalNumPeople = 0;

// Takes array of 4 data points to check if someone might be entering
// or leaving. Returns bool to indicate false positive or not.
function checkPotentialMove(potentialArray) {
  // check the 5 data points, return true or false for movement
  var result = regression.linear(potentialArray);
  if(result.r2 > 0.60 && result.equation[0] < -1.75 && result.equation[0] > -35)
    return true;
  else
    return false;
}

// takes array of many data points and determines if person is approaching
// or leaving. Returns bool to indicate movement.
function checkMove(checkMoveArray) {
  // check 15 data points, return true or false for movement
  var result = regression.linear(checkMoveArray);
  if(result.r2 > .69 && result.equation[0] < -1.75 && result.equation[0] > -35)
    return true;
  else
    return false;
}

// function to upload data to mongodb
// does not take any params as only data sent will be 1 and a timestamp
function uploadToDB() {
	var request = require('request');
	var JSONobj = {"increment":"1"};

	request({
		url: "http://tufts-gym-monitor.herokuapp.com/data",
		method: "POST",
		json: true,
		body: JSONobj
	}, function (error, response, body) {
		//console.log(response);
		//console.log(error);
	});
}

// on alert (pin state change), calculate PWM
(function(){
  //console.log("now running...");
  var startTick;
  var moveOrNah = false;
  var counter = 0; // variable to track how many data points have been taken

  echo.on('alert', function(level, tick) {
    var endTick,diff;

    if(level == 1) {
      startTick = tick;
    } else {
        endTick = tick;
	// calculates PWM 
        diff = (endTick >> 0) - (startTick >> 0);
	// Convert to 2 decimal string, parse back into float
        diff = diff/2/MICROSECONDS_PER_CM;
	diff = diff.toFixed(2);
	diff = parseFloat(diff);
	//console.log(diff);

        // if potential move has not been recognized, continue
	// searching for potential move
	if(moveOrNah == false && diff < 390.00 && counter < 4){
          dataPoint.push(counter);
          dataPoint.push(diff);
          potentialArr.push(dataPoint);
          counter++;
	  dataPoint = [];
        }
	else if(moveOrNah == true && diff < 390.00 && counter < 15) {
	  dataPoint.push(counter);
	  dataPoint.push(diff);
	  checkMoveArr.push(dataPoint);
	  counter++;
	  dataPoint = [];
        }	
    }
    // check for potential movement after every 4 data 
    if(moveOrNah == false && counter == 4) {
      moveOrNah = checkPotentialMove(potentialArr);
      counter = 0;
      potentialArr = [];
    }
    // after a potential move has been identified, log 15 data points/check again
    else if(moveOrNah == true && counter == 15) {
      moveOrNah = false;
      counter = 0;
      //console.log("Potential move detected, analying now...");
      var movement = checkMove(checkMoveArr);
      if(movement == true) {
	totalNumPeople++;
	//console.log("Movement confirmed! New total: "+totalNumPeople);
	uploadToDB();
      }
      else {
	//console.log("No movement was confirmed, continuing...");
      }
      checkMoveArr = [];
    }
  });
}());

setInterval(function() {
  trigger.trigger(21, 1);
}, 65);

