var express = require('express');
var fs = require('fs')
var bodyParser = require('body-parser');
var validator = require('validator');
var url = require("url");
var schedule = require('node-schedule');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP post parameters

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/nodemongoexample';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	 db = databaseConnection;
});

app.use(express.static(__dirname + '/public'));

var http = require("http");
setInterval(function() {
    http.get("http://tufts-gym-monitor.herokuapp.com/");
}, 30000);

var count = 0;
// hours
var rule = new schedule.RecurrenceRule();
//rule.minute = [0,5,10,15,20,25,30,35,40,45,50,55,59];
rule.second = [59];
schedule.scheduleJob(rule, function(){
   db.collection('hours', function(er, collection) { 
      var now = new Date();
      var hour = now.getHours();
      var minute = now.getMinutes();
      var day = now.getDay();
      var date = now.getDate();
      var month = now.getMonth();
      var year = now.getYear();
      hour -= 4;
      if (hour < 0)
      {
         hour += 24;
      }
      db.collection('increments', function(er, collection) {
         collection.find({}).toArray(function(err, results) {
            var count = 0;
            var dayCount = 0;
            for (var i = 0; i < results.length; i++)
            {
               count += parseFloat(results[i].increment);

               if (parseFloat(results[i].increment) == 1)
                  dayCount++;
            }
         
            var toInsertHr = 
               {
                  "hour": hour,
                  "number": count
               };

            if (hour >= 20)
            {            
               var toInsertDay = 
               {
                  "day": day - 1,
                  "number": dayCount
               };
            } else 
            {
               var toInsertDay = 
               {
                  "day": day,
                  "number": dayCount
               };
            }

            var toInsertDate = 
               {
                  "number": dayCount
               };
            JSON.stringify(toInsertHr);
            JSON.stringify(toInsertDay);
            JSON.stringify(toInsertDate);
            db.collection('hours', function(error, coll) {
                  var previous_entry = { "hour": hour};
                  coll.remove(previous_entry, function(err, coll){
                     db.collection('hours', function(error, coll) {
                        coll.insert(toInsertHr, function(error, co) {

                           db.collection('days', function(error, collD) {
                           var previous_entry_day = { "day": day};
                           collD.remove(previous_entry_day, function(error, col) {
                              db.collection('days', function(error, collD) {
                                 collD.insert(toInsertDay, function(error, saved) {

                                    if (hour == 0 && minute == 0)
                                    {
                                       db.collection('dates', function(error, collDa) {
                                          collDa.insert(toInsertDate, function(error, saved) {
                                             db.collection('hours', function(error, colltodelete) {
                                                colltodelete.remove();
                                                   db.collection('increments', function(error, colldelete) {
                                                   colldelete.remove();
                                             });
                                             });

                                             

                                          });
                                       }); 
                                    

                                       if (date == 1)
                                       {
                                          db.collection('dates', function(er, collection) {
                                             collection.find({}).toArray(function(err, results) {
                                                var monthCount = 0;
                                                for (var i = 0; i < results.length; i++)
                                                {
                                                   monthCount += parseFloat(results[i].increment);
                                                }
                                                var toInsert = 
                                                {
                                                   "month": month,
                                                   "number": monthCount
                                                };

                                                   db.collection('dates', function(error, colltodelete) {
                                                      colltodelete.remove();
                                                   });
                                             });
                                          });
                                       } 

                                       if (month == 0 && date == 1)
                                       {
                                          db.collection('months', function(er, collection) {
                                             collection.find({}).toArray(function(err, results) {
                                                var yearCount = 0;
                                                for (var i = 0; i < results.length; i++)
                                                {
                                                   yearCount += parseFloat(results[i].increment);
                                                }
                                                var toInsert = 
                                                {
                                                   "year": year - 1,
                                                   "number": yearCount
                                                };

                                                   db.collection('months', function(error, colltodelete) {
                                                      colltodelete.remove();
                                                   });
                                             });
                                          });
                                       } 
                                    }

                                    });
                                 });
                              });
                           });    
                        });
                     });
                  });
            });      
         });
      });         
   });
});

app.get('/', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
   response.header("Access-Control-Allow-Headers", "X-Requested-With");
   response.set('Content-Type', 'text/html');
   db.collection('increments', function(er, collection) {
      collection.find({}).toArray(function(err, results) {
         var count = 0;
         for (var i = 0; i < results.length; i++)
         {
            count += parseFloat(results[i].increment);
         }

         fs.readFile("index.html", 'utf8', function (err,data) {
         var result = data.replace("toBeReplaced", count.toString());
         result = result.replace("drawCircle", "<figcaption>" + count.toString() + " People</figcaption>");
         if (count <= 15)
         {
            result = result.replace("business", "The gym is almost empty.");
            result = result.replace("percent", "<figure class=chart data-percent=25>");
         }
         else if (count > 15 && count <= 30)
         {
            result = result.replace("business", "The gym is almost half full.");
            result = result.replace("percent", "<figure class=chart data-percent=50>");
         }
         else if (count > 30 && count <= 45)
         {
            result = result.replace("business", "The gym is moderately busy.");
            result = result.replace("percent", "<figure class=chart data-percent=50>");
         }
         else if (count > 45 && count < 60)
         {
            result = result.replace("business", "The gym is pretty busy.");
            result = result.replace("percent", "<figure class=chart data-percent=75>");
         }
         else 
         {
            result = result.replace("business", "The gym is super busy.");
            result = result.replace("percent", "<figure class=chart data-percent=100>");
         }
         response.send(result);
         });
      });
   });
   	
});

app.get('/script.js', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
   response.header("Access-Control-Allow-Headers", "X-Requested-With");
   response.set('Content-Type', 'text/js');

   var result;
   // fs.readFile("script.js", 'utf8', function (err,data) {
   // result = data.replace("number7", 1);
   // response.send(result);  
   // });
   db.collection('hours', function(er, collection) {
      collection.find({}).toArray(function(err, results) {
         db.collection('days', function(er, collectionD) {
            collectionD.find({}).toArray(function(err, resultsD) {
               db.collection('months', function(er, collectionM) {
                  collectionM.find({}).toArray(function(err, resultsM) {
                     fs.readFile("script.js", 'utf8', function (err,data) {

                     // hr
                     var sevenCount = 0;
                     var eightCount = 0;
                     var nineCount = 0;
                     var tenCount = 0;
                     var elevenCount = 0;
                     var twelveCount = 0;
                     var thirteenount = 0;
                     var fourteenCount = 0;
                     var fifteenCount = 0;
                     var sixteenCount = 0;
                     var seventeenCount = 0;
                     var eighteenCount = 0;
                     var nineteenCount = 0;
                     var twentyCount = 0;
                     var twentyoneCount = 0;
                     var twentytwoCount = 0;

                     // week
                     var mon = 0;
                     var tues = 0;
                     var wed = 0;
                     var thur = 0;
                     var fri = 0;
                     var sat = 0;
                     var sun = 0;

                     // months
                     var jan = 0;
                     var feb = 0;
                     var mar = 0;
                     var apr = 0;
                     var may = 0;
                     var jun = 0;
                     var jul = 0;
                     var aug = 0;
                     var sep = 0;
                     var oct = 0;
                     var nov = 0;
                     var dec = 0;
                     // year

                     var year = 0;
                     for (var i = 0; i < results.length; i++)
                     {
                        if (results[i].hour == 7)
                           sevenCount = results[i].number;
                        else if (results[i].hour == 8)
                           eightCount = results[i].number;
                        else if (results[i].hour == 9)
                           nineCount = results[i].number;
                        else if (results[i].hour == 10)
                           tenCount = results[i].number;
                        else if (results[i].hour == 11)
                           elevenCount = results[i].number;
                        else if (results[i].hour == 12)
                           twelveCount = results[i].number;
                        else if (results[i].hour == 13)
                           thirteenount = results[i].number;
                        else if (results[i].hour == 14)
                           fourteenCount = results[i].number;
                        else if (results[i].hour == 15)
                           fifteenCount = results[i].number;
                        else if (results[i].hour == 16)
                           sixteenCount = results[i].number;
                        else if (results[i].hour == 17)
                           seventeenCount = results[i].number;
                        else if (results[i].hour == 18)
                           eighteenCount = results[i].number;
                        else if (results[i].hour == 19)
                           nineteenCount = results[i].number;
                        else if (results[i].hour == 20)
                           twentyCount = results[i].number;
                        else if (results[i].hour == 21)
                           twentyoneCount = results[i].number;
                        else if (results[i].hour == 22)
                           twentytwoCount = results[i].number;
                     }

                     // year
                     for (var i = 0; i < resultsD.length; i++)
                     {
                        if (resultsD[i].day == 1)
                           mon = resultsD[i].number;
                        else if (resultsD[i].day == 2)
                           tues = resultsD[i].number;
                        else if (resultsD[i].day == 3)
                           wed = resultsD[i].number;
                        else if (resultsD[i].day == 4)
                           thur = resultsD[i].number;
                        else if (resultsD[i].day == 5)
                           fri = resultsD[i].number;
                        else if (resultsD[i].day == 6)
                           sat = resultsD[i].number;
                        else if (resultsD[i].day == 7)
                           sun = resultsD[i].number;
                     }

                     for (var i = 0; i < resultsM.length; i++)
                     {
                        year += resultsM[i].number;
                        if (resultsM[i].month == 1)
                           jan = resultsM[i].number;
                        else if (resultsM[i].month == 2)
                           feb = resultsM[i].number;
                        else if (resultsM[i].month == 3)
                           mar = resultsM[i].number;
                        else if (resultsM[i].month == 4)
                           apr = resultsM[i].number;
                        else if (resultsM[i].month == 5)
                           may = resultsM[i].number;
                        else if (resultsM[i].month == 6)
                           jun = resultsM[i].number;
                        else if (resultsM[i].month == 7)
                           jul = resultsM[i].number;
                        else if (resultsM[i].month == 8)
                           aug = resultsM[i].number;
                        else if (resultsM[i].month == 9)
                           sep = resultsM[i].number;
                        else if (resultsM[i].month == 10)
                           oct = resultsM[i].number;
                        else if (resultsM[i].month == 11)
                           nov = resultsM[i].number;
                        else if (resultsM[i].month == 12)
                           dec = resultsM[i].number;
                     }


                     result = data.replace("number7", sevenCount);
                     result = result.replace("number8", eightCount);
                     result = result.replace("number9", nineCount);
                     result = result.replace("number10", tenCount);
                     result = result.replace("number11", elevenCount);
                     result = result.replace("number12", twelveCount);
                     result = result.replace("number13", thirteenount);
                     result = result.replace("number14", fourteenCount);
                     result = result.replace("number15", fifteenCount);
                     result = result.replace("number16", sixteenCount);
                     result = result.replace("number17", seventeenCount);
                     result = result.replace("number18", eighteenCount);
                     result = result.replace("number19", nineteenCount);
                     result = result.replace("number20", twentyCount);
                     result = result.replace("number21", twentyoneCount);
                     result = result.replace("number22", twentytwoCount);

                     result = result.replace("week1", mon);
                     result = result.replace("week2", tues);
                     result = result.replace("week3", wed);
                     result = result.replace("week4", thur);
                     result = result.replace("week5", fri);
                     result = result.replace("week6", sat);
                     result = result.replace("week7", sun);

                     result = result.replace("month1", jan);
                     result = result.replace("month2", feb);
                     result = result.replace("month3", mar);
                     result = result.replace("month4", apr);
                     result = result.replace("month5", may);
                     result = result.replace("month6", jun);
                     result = result.replace("month7", jul);
                     result = result.replace("month8", aug);
                     result = result.replace("month9", sep);
                     result = result.replace("month10", oct);
                     result = result.replace("month11", nov);
                     result = result.replace("month12", dec);

                     result = result.replace("year1", year);



                     response.send(result);  
                     });
                  });
               });
            });
         }); 
      });
   });
   
});


app.get('/style.css', function(request, response) {
	response.header("Access-Control-Allow-Origin", "*");
   	response.header("Access-Control-Allow-Headers", "X-Requested-With");
   	response.set('Content-Type', 'text/css');
   	response.sendFile("style.css", {root:__dirname});
});

app.get('/hover.css', function(request, response) {
   response.header("Access-Control-Allow-Origin", "*");
      response.header("Access-Control-Allow-Headers", "X-Requested-With");
      response.set('Content-Type', 'text/css');
      response.sendFile("hover.css", {root:__dirname});
});

app.post('/data', function(request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   response.header("Access-Control-Allow-Headers", "X-Requested-With");
   response.setHeader('Content-Type', 'application/json');
   var obj = request.body;
   if (obj.hasOwnProperty('increment'))
   {
      var change = parseFloat(obj.increment);
      var toInsert = 
      {
         "increment": change,
         "created_at": new Date()
      };
      db.collection('increments', function(error, coll) {
         coll.insert(toInsert, function(error, saved) {
                  response.send("hi");
         });
      });
   }
});

app.listen(process.env.PORT || 3000);