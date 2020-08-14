var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
//const { enabled } = require('debug');
//var maxOptions = { "sort": [['uid',-1]] };
const allUSER = 99999999;

/* GET all users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.url == '/') req.url = '/group/0';
  //console.log(req.url);
  next('route');
});

// get all user of group
router.get('/group', function(req, res, next) {
  req.url = '/group/1';
  next('route');
});

// get users belonging to group "mygroup"
router.get('/group/:mygroup', function(req, res, next) {
  var {mygroup}=req.params;
  var igroup = parseInt(mygroup);
  if (isNaN(igroup)) { res.status(400).send("Invalid group number"); return; }
  console.log(mygroup);
  
  if (igroup == 0) { publish_users(res, {}); return; }
  else {
    // publish users which beling to group "igroup"
    mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {    
      GroupMember.find({gid:igroup}, (err, gmlist) => {
        //console.log(gmlist.length);
        var myuid = [];
        gmlist.forEach(gm_element => { 
          //console.log(gm_element);
          myuid.push(gm_element.uid) 
        });
        //console.log(myuid);
        let filter = { uid: { $in: myuid } };
        publish_users(res, filter);
      });
    });
  }
});

/// for signup, login and reset
router.get('/:userAction/:userName/:password', function(req, res, next) {
  // Confirm if user if valid user
  // And also password is correct
  console.log("User Action " + userAction);
  var {userAction,userName,password}=req.params;
  userAction = userAction.toLowerCase();
  userName = userName.toLowerCase().replace(/\s/g, "");

  
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
      //console.log("MongoDB database connection established successfully");
    let User;

    // compile schema to model
    try{ User = mongoose.model("users", UserSchema);}
    catch(err){
      User=mongoose.model("users")
    }

    User.findOne({userName},(err,resu)=>{
      switch(userAction)
      {
        case "login":
          if ((resu != null) && (resu.password == password))
            sendok(res, "login success");
          else
            senderr(res, "Incorrect User Name or Password");
          break;
        case "signup":
          if(resu)
            senderr(res, "User " + userName + " already exists");
          else {
            var uid=0;
            var query = User.find();
            query.limit(1);
            query.sort({"uid":-1})
            query.limit(1).sort({"uid":-1}).exec(function (err, doc) {
              if (err) senderr(res, err);
              else
              {
                uid = doc[0].uid + 1;
                var user1 = new User({ 
                uid: uid,
                userName: userName,
                password: password,
                status: true });
                console.log(user1);
                //User.insertMany(user1);
                user1.save(function(err) {
                  if (err) senderr(res, "Could add new record");
                  else sendok(res, "Added new user " + user1.userName);
                });
              };
            });
          }
          break;
        case "reset":
          if(resu){
            resu.password = password;
            resu.save(function(err) {
              console.log(err);
              if (err) senderr(res, "Could not reset password");
              else sendok(res,"Password updated for user " + userName);
            });
          }
          else 
            senderr(res, "Invalid user");
          break;
        default:
          senderr(res, "Invalid User Option");
          break;
      }
    });
  });
});


// get users balance
// only group 1 supported which is default group
router.get('/balance/:myuser', function(req, res, next) {
  var {myuser} = req.params;
  var iuser = parseInt(myuser);
  var igroup = 1;
  if (isNaN(iuser)) { res.status(400).send("Invalid user " + myuser); return; }

  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {    
    GroupMember.find({gid: igroup, uid: iuser}).countDocuments(function(err, count) {
      if (err) { senderr(res, err); return; }
      else if (count != 1) { senderr(res, "User does not belog to group 1"); return; }
      else {
        Auction.find({gid:igroup, uid: iuser}, (err, alist) => {
          //console.log(gmlist.length);
          var sum = 0;
          alist.forEach(a_element => { 
            //console.log(a_element);
            sum = sum + a_element.bidAmount;
          });
          //console.log(sum);
          res.send((1000 - sum).toString());
        });
      }
    });
  });
});

router.get('/myteam', function(req, res, next) {
  req.url = '/myteam/' + allUSER;
  next('route');
});

// get players purchased by me.
// currently only group 1 supported
router.get('/myteam/:userid', function(req, res, next) {
var {userid} = req.params;
let igroup = 1;   // default group 1
let iuser = (userid.toUpperCase() != "ALL") ? parseInt(userid) : allUSER;
if (isNaN(iuser)) { res.status(400).send("Invalid user " + userid); return; }

mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {    
  Auction.find({gid: igroup}, (err, datalist) => {    
    if (!datalist) { res.status(400).send(err); return; }

    // filter if players of only given user is required. 0 means players of ALL users
    if (iuser !=  allUSER)
      datalist = _.filter(datalist, (e) => e.uid === iuser);

    // make grouping of players per user
    var grupdatalist = _.reduce(datalist, (result, user) => {
      (result[user.uid] || (result[user.uid] = [])).push(user);
      return result;
    }, {});
    //let keys = _.keys(grupdatalist);
    //console.log(keys);
    res.send(grupdatalist);
  });
});
});

function publish_users(res, filter_users)
{
  //console.log(filter_users);
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    User.find(filter_users,(err,ulist) =>{
      if(!ulist){ res.status(400).send("Unable to fetch users from database"); return; }
      else {
        // console.log("Length is " + ulist.length);
        //ulist.splice(ulist.findIndex(item => item.field === "password"), 1)
        ulist = ulist.filter(function( obj ) {
          return obj.field !== "password";
        });
        res.send(ulist);
      }
    });
  });
}


function senderr(res, msg)    { res.status(400).send(msg); }
function sendok(res, msg)     { res.send(msg); }
module.exports = router;

/** codes used for testing
let words = ['sky', 'wood', 'forest', 'falcon', 
    'pear', 'ocean', 'universe'];

let fel = _.first(words);
let lel = _.last(words);


let users = [
  { name: 'John', age: 25, occupation: 'gardener' },
  { name: 'Lenny', age: 45, occupation: 'programmer' },
  { name: 'Andrew', age: 43, occupation: 'teacher' },
  { name: 'Peter', age: 25, occupation: 'gardener' },
  { name: 'Anna', age: 43, occupation: 'teacher' },
  { name: 'Albert', age: 45, occupation: 'programmer' },
  { name: 'Adam', age: 25, occupation: 'teacher' },
  { name: 'Robert', age: 43, occupation: 'driver' }
];

//let u2 = _.find(users, (u) => { return u.age < 30 });
// var u2 = YourArray.filter(function( obj ) {
//   return obj.value === 1;
// });
// console.log(u2);

let grouped = _.reduce(users, (result, user) => {

    (result["AGE"+user.age] || (result["AGE"+user.age] = [])).push(user);  
    return result;
}, {});

var g25 = grouped.AGE25;


 
 */