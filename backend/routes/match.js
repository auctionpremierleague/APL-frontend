
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
const { enabled } = require('debug');

/* GET all users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //res.send("Match controller under development");
  if (req.url == '/') req.url = '/list/all';
  else                req.url = '/list' + req.url;
  next('route');
});

/* GET all users listing. */
router.use('/list/:myteam', function(req, res, next) {
    var {myteam} = req.params;
    myteam = myteam.toUpperCase();
    let myfilter;
    if (myteam == "ALL")  { myfilter = {}; }
    else                  { myfilter = {$or: [ {team1: myteam}, {team2: myteam} ]}; } 
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
