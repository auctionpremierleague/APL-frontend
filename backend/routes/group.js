var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
const { enabled } = require('debug');

/* GET users listing. */
router.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.url == '/') req.url = '/list';
  next('route');
});

router.get('/list', function(req, res, next) {

    mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    GroupMember.find({},(err,resu)=>{
     if(resu){console.log(resu)}
     res.send(resu);
   });
 
   }); 
 });
 
router.get('/:groupAction/:groupid/:ownerid/:userid', function(req, res, next) {
  var {groupAction,groupid,ownerid,userid}=req.params;
  groupAction = groupAction.toLowerCase();
  if (groupAction != "add") { senderr(res, "Invalid action"); return; }
  if (groupid != "1") { senderr(res, "Invalid Group"); return; }
  if (ownerid == userid) {senderr(res, "Owner already added to group 1"); return; }

  igroup = 1;
  iowner = parseInt(ownerid);
  if (isNaN(iowner)) { senderr(res, "Invalid owner"); return; }
  iuser = parseInt(userid);
  if (isNaN(iuser)) { senderr(res, "Invalid user"); return; }

  console.log(mongoose_conn_string);
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    // first check if owner of the group is correct
    console.log("IN group connect");
    //User.findOne({userName},(err,resu)=>{
    //Group.findOne({}, (err, gdoc) => {
    //if (err) { senderr(res, err); return; }
    //else if (gdoc == null) { console.log("null"); senderr(res, "User " + ownerid + " does not own group " + groupid); return; }
    //else 
    {
        console.log("Valid owner and group");
        var myamount = 1000;
        User.findOne({uid:iuser}, (err, udoc) => {
            if (err) {senderr(res, err); return;}
            else if (udoc == null) { senderr(res, "Invalid user"); return}
            else { 
                console.log("Valid USer");              
                GroupMember.findOne({gid:1, uid: iuser}, (err, gmdoc) =>  {
                    if (err) {senderr(res, err); return;}
                    else if (gmdoc != null) { senderr(res, "User already added to group 1"); return; }
                    else {                
                        //  confirmed that Group 1 exists
                        //  confirmed that owner of the group is correct
                        //  confirmed that new user is correct                        
                        var gmrec = new GroupMember({ 
                            gid: 1,
                            uid: iuser,
                            balanceAmount: myamount
                        });
                        gmrec.save(function(err) {
                            if (err) {senderr(res, "Uable to added user to Group 1"); }
                            else { sendok(res, "Added user "+iuser+" to Group 1"); }
                        });
                    }
                }); // check group member record
            }
        });
    }   // Group and owner matched in group record
   // }); // group  findone
}); // mongoose connect
}); // end of get


function senderr(res, msg)
{
  res.status(400).send(msg);
}

function sendok(res, msg)
{
  res.send(msg);
}

module.exports = router;
