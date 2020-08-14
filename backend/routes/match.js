
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
const { enabled } = require('debug');

/* GET all users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //res.send("Match controller under development");
  console.log("Original: " + req.url);
  var tmp = req.url.split('/');
  console.log(tmp.length);
  switch (tmp.length)
  {
    case 2:  
      if (tmp[1].length == 0) tmp[1] = "all";
      req.url = "/list/" + tmp[1] + "/none";
      break;
    case 3:
      if (tmp[2].length == 0) 
        tmp[2] = "none";
      req.url = "/list/" + tmp[1] + "/" + tmp[2];
      break;  
    case 4: 
      if (tmp[3].length == 0) 
        req.url = "/list/" + tmp[1] + "/" + tmp[2];
      break;
  }
  console.log("Modified: " + req.url);
  next('route');
});



/* GET all matches of given listing. */
router.use('/list/:myteam1/:myteam2', function(req, res, next) {
    var {myteam1,myteam2} = req.params;
    myteam1 = myteam1.toUpperCase();
    myteam2 = myteam2.toUpperCase();
    console.log("Single entry " + myteam1);
    console.log("Single entry " + myteam2);


    let myfilter;
    if (myteam1 == "ALL")  
      myfilter = {};
    else if (myteam2 == "NONE") 
      myfilter = {$or: [ {team1: myteam1}, {team2: myteam1} ]};
    else
      myfilter = {team1: {$in: [myteam1, myteam2]}, team2: {$in: [myteam1, myteam2]} };
    console.log(myfilter);
    publish_matches(res, myfilter);
});


function publish_matches(res, myfilter)
{
  //console.log(myfilter);
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    Match.find(myfilter,(err,datalist) =>{
      if(!datalist){res.status(400).send("Unable to fetch matches from database"); return; }
      else {
        console.log("Length is " + datalist.length);
        res.send(datalist);
      }
    });
  });
}



function senderr(res, msg)  { res.status(400).send(msg); }
function sendok(res, msg)   { res.send(msg); }
module.exports = router;
