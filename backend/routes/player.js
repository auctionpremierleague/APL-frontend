var express = require('express');
var router = express.Router(
);
const mongoose = require("mongoose");
const { request } = require('express');

/* GET users listing. */
router.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.url == '/') req.url = '/list/all';
  next('route');
});


// get all players
router.get('/sold', function(req, res, next) {
  // translate it to /list/all
  req.url = '/list/sold'
  next('route');
});

// get all players
router.get('/unsold', function(req, res, next) {
  req.url = '/list/unsold';
  next('route');
});

// get ALL / SOLD / UNSOLD players 
router.get('/list/:oper', function(req, res, next) {
  var {oper}=req.params;
  oper = oper.toUpperCase();
  console.log(oper);
  var mypid = [];
  if (oper == "ALL") { publish_players(res, {}) }
  else if ((oper == "SOLD") || (oper == "UNSOLD")) {
    mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {    
      Auction.find({gid:1}, (err, alist) => {
        //console.log(alist.length);
        alist.forEach(auction_element => { 
          //console.log(auction_element);
          mypid.push(auction_element.pid) 
        });
        //console.log(mypid);
        let filter;
        if (oper == "SOLD") filter = { pid: { $in: mypid } };
        else                filter = { pid: { $nin: mypid } };
        publish_players(res, filter);
      });
    });
  } 
  else 
    res.status(400).send("Invalid option " + oper);
});

router.get('/available/:playerid', function(req, res, next) {
  var {playerid}=req.params;
  var iplayer = parseInt(playerid);
  if (isNaN(iplayer)) { res.status(400).send("Invalid player id " + playerid); return; }
  
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {    
    //  first confirm player id is correct
    Player.find({pid:iplayer}).countDocuments(function(err, pcount) {
      if (err) { res.status(400).send(err); return; }
      else if (pcount == 0) { res.status(400).send("Invalid player " + playerid); return;}
      else {
        Auction.find({gid: 1, pid:iplayer}).countDocuments(function(err, acount) {
          if (err) { res.status(400).send(err);  return; }
          else {
            var sts = (acount == 0);
            res.send(sts);
          }
        });
      }
    });
  });
});



function publish_players(res, filter_players)
{
  //console.log(filter_players);
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    Player.find(filter_players,(err,plist) =>{
      if(!plist){res.status(400).send("Unable to fetch players from database"); return; }
      else {
        console.log("Length is " + plist.length);
        res.send(plist);
      }
    });
  });
}


module.exports = router;
