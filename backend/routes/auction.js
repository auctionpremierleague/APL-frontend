var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
const { enabled } = require('debug');
var maxOptions = { "sort": [['uid',-1]] };

/* GET users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});

router.get('/list', function(req, res, next) {
    mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
     // console.log("MongoDB database connection established successfully");
   Auction.find({},(err,resu)=>{
    if (err) { senderr(res, err)}
    else if(!resu){console.log(resu); senderr(res, "Error fetching usres"); }
    else res.send(resu);
  });
  })
  });

  router.get('/:oper/:groupId/:userId/:playerId/:bidValue', function(req, res, next) {
    // Confirm if user if valid user
    // And also password is correct
    var {oper,groupId,userId,playerId,bidValue}=req.params;
    // only operation currently supported is ADD
    oper = oper.toLowerCase();
    if (oper != "add") { senderr(res, "Invalid operation for aution"); return; }
    // check if valid ID
    if (groupId != "1") { senderr(res, "Invalid Group"); return; }
    var igroup = 1;

    var iuser = parseInt(userId);
    if (isNaN(iuser)) { senderr(res, "Invalid User"); return next;}
    var iplayer = parseInt(playerId);
    if (isNaN(iplayer)) { senderr(res, "Invalid Player"); return;}
    var ibid = parseInt(bidValue);
    if (isNaN(ibid)) { senderr(res, "Invalid bid amount"); return;} 

  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
      //console.log("MongoDB database connection established successfully");
    let auctionRec;

    console.log(oper);
    console.log(igroup);
    console.log(iuser);
    console.log(iplayer);
    console.log(ibid);
    var mydata = igroup + iuser;
    console.log(mydata);

    GroupMember.find({gid:1, uid: iuser}).countDocuments(function(err, count) {
    if (err) {senderr(res, err); return;}
    else if (count != 1) {
      res.status(400).send("User " + iuser + " does not belong to Group 1");
      return;  
    }else {
        // user correct and belongs to group. Now check player is correct
        Player.find({pid:iplayer}).countDocuments(function(err, pcount) {
        if (err) {senderr(res, err); return;}
        else if (pcount != 1) { res.status(400).send("Invalid player"); } 
        else {
            // user and players valid. Now check if bidding done
            Auction.find({gid: igroup,pid:iplayer}).countDocuments(function(err, result) {
                if (err) {senderr(res, err); return;}
                else if (result > 0) {senderr(res, "Already purchased"); return;}
                else {
                    console.log("Player available");
                    Auction.find({gid: 1, uid: iuser}).exec(function (err, doc) {
                        if (err) senderr(res, err);
                        else {
                            const balance = 1000 - doc.reduce((accum, userrec) => {
                                return accum + userrec.bidAmount;
                            }, 0);
                            console.log(balance);
                            if (balance < ibid ) senderr(res, "insuggicient balance");
                            else {
                                console.log("Balance availab;e");
                                var bidrec = new Auction({ uid: iuser,
                                    pid: iplayer,
                                    gid: 1,
                                    bidAmount: ibid 
                                });
                                bidrec.save(function(err) {
                                    if (err) senderr(res, "Could not add new Auction record");
                                    else sendok(res, "Added bid for player" + bidrec.bidAmount);
                                }); 
                            }
                        }
                    });          
                }
            });
        }  
        });  // players find   
    }
    }); // user find    
    }); // mongoose connect
  });  // aution get

function senderr(res, msg)
{
  res.status(400).send(msg);
}

function sendok(res, msg)
{
  res.send(msg);
}

module.exports = router;
