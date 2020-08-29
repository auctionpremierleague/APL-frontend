const { route } = require(".");
router = express.Router();

const allUSER = 99999999;
const is_Captain = true;
const is_ViceCaptain = false;
let CricRes;
var groupRecord;

/* GET all users listing. */
router.get('/', function(req, res, next) {
  CricRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB);  return; }
  
  if (req.url == "/")
    publish_users({});
  else
    next('route');
  });


// get all user of group
router.get('/group', async function(req, res, next) {
  CricRes = res;
  setHeader();  

  showGroupMembers(1);
});

// get users belonging to group "mygroup"
router.get('/group/:mygroup', async function(req, res, next) {
  CricRes = res;
  setHeader();

  var {mygroup} = req.params;

  // currently only Group 1 supported.
  if (mygroup != "1") {senderr(601, "Invalid group number"); return;}
  showGroupMembers(1);

});

//=============== SIGNUP
router.get('/signup/:userName/:userParam', function(req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});

//=============== RESET
router.get('/reset/:userName/:userParam', function(req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});

//=============== LOGIN
router.get('/login/:userName/:userParam', function(req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});


//==================== internally called for signup, login and reset
router.get('/internal/:userAction/:userName/:userParam', function(req, res, next) {
  CricRes = res;
  setHeader();

  var {userAction,userName,userParam}=req.params;
  userAction = userAction.toLowerCase();
  userName = userName.toLowerCase().replace(/\s/g, "");
  //if (!db_connection) return;

  User.findOne({userName}, function(err, urec) {
    if (err)
      senderr(DBFETCHERR, err);
    else {
      switch (userAction) {
        case "login":
          if ((urec) && (urec.password == userParam))
            sendok("Successful login by user " + userName + " in CricDream");
          else
            senderr(602, "Invalid User name or password");
          break;
        case "reset":
          if (urec) {
            urec.password = userParam;
            urec.save(function(err) {
              //console.log(err);
              if (err)  senderr(DBFETCHERR,"Could not reset password");
              else      sendok("Password updated for user " + userName);
            });
          } else
            senderr(602, "Invalid User name or password");
          break;
        case "setdisplay":
          if (urec) {
            console.log(urec);
            urec.displayName = userParam;
            urec.save(function(err) {
              //console.log(err);
              if (err)  senderr(DBFETCHERR,"Could not update display name");
              else      sendok("Display Name updated for user " + userName);
            });
          } else
            senderr(602, "Invalid User name or password");
          break;
        case "signup":
          if (!urec)
          {
            User.find().limit(1).sort({"uid":-1}).exec(function (err, doc) {
              if (err) senderr(DBFETCHERR, err);
              else
              {
                var user1 = new User({ 
                uid: doc[0].uid + 1,
                userName: userName,
                displayName: userName,
                password: userParam,
                status: true });
                user1.save(function(err) {
                  if (err)
                    senderr(DBFETCHERR, "Unable to add new User record");
                  else 
                    sendok("Welcome to CricDream " + user1.userName);
                });
              }
            });
          } else
            senderr(603, "User already configured in CricDream");
          break;
      } // end of switch
    }
  });
});

// select caption for the user (currently only group 1 supported by default)
router.get('/captain/:myuser/:myplayer', function(req,  res, next) {
  CricRes = res;
  setHeader();

  if (ipl_started())
  {
    senderr(604, "IPL has started!!!! Cannot set Captain");
    return;
  }
  var {myuser, myplayer} = req.params;
  var iuser = parseInt(myuser);
  var iplayer = parseInt(myplayer);
  var igroup = 1;

  if (isNaN(iuser)) { senderr(605, "Invalid user"); return; }
  if (isNaN(iplayer)) { senderr(606, "Invalid player"); return; }

  Auction.find({gid: igroup, uid: iuser, pid: iplayer}).countDocuments(function(err, count) {
    if (err)
      senderr(DBFETCHERR, err);
    else if (count == 0)
      senderr(607,"Player " + iplayer + " not purchased by user " + iuser);
    else {
      updateCaptainOrVicecaptain(iuser, iplayer, is_Captain);
    }
  });
});

// select vice caption for the user (currently only group 1 supported by default)
router.get('/vicecaptain/:myuser/:myplayer', function(req,  res, next) {
  CricRes = res;
  setHeader();

  if (ipl_started())
  {
    senderr(604, "IPL has started!!!! Cannot set Vice Captain");
    return;
  }
  var {myuser, myplayer} = req.params;
  var iuser = parseInt(myuser);
  var iplayer = parseInt(myplayer);

  if (isNaN(iuser)) { senderr(605,"Invalid user"); return; }
  if (isNaN(iplayer)) { senderr(606, "Invalid player"); return; }
  var igroup = 1;
  Auction.find({gid: igroup, uid: iuser, pid: iplayer}).countDocuments(function(err, count) {
    if (err)
      senderr(DBFETCHERR, err);
    else if (count == 0)
      senderr(607, "Player " + iplayer + " not purchased by user " + iuser);
    else {
      // user has purchased this player. User is eligible to set this player as vice captain
      updateCaptainOrVicecaptain(iuser, iplayer, is_ViceCaptain);
    }
  });
});

// get users balance
// only group 1 supported which is default group
router.get('/balance/:myuser', function(req, res, next) {
  CricRes = res;
  setHeader();

  var {myuser} = req.params;
  var iuser = parseInt(myuser);
  var igroup = 1;
  if (isNaN(iuser)) { senderr(605,"Invalid user " + myuser); return; }

  //mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {    
  GroupMember.find({gid: igroup, uid: iuser}).countDocuments(function(err, count) {
    if (err) 
      senderr(DBFETCHERR, err); 
    else if (count != 1)
    { 
      senderr(608,"User does not belong to group 1"); 
    }else{
      Auction.find({gid:igroup, uid: iuser}, (err, alist) => {
        var mybal = 1000 - _.sumBy(alist, 'bidAmount'); //alist.reduce((a, {bidAmount}) => a + bidAmount, 0);
        sendok(mybal.toString());
      });
    }
  });
});

router.get('/myteam', function(req, res, next) {
  CricRes = res;
  setHeader();

  publish_auctionedplayers(allUSER);
});

// get players purchased by me.
// currently only group 1 supported
router.get('/myteam/:userid', function(req, res, next) {
  CricRes = res;
  setHeader();

  var {userid} = req.params;
  let igroup = 1;   // default group 1
  let iuser = (userid.toUpperCase() != "ALL") ? parseInt(userid) : allUSER;
  if (isNaN(iuser))
    senderr(605, `Invalid user ${userid}`);
  else
    publish_auctionedplayers(iuser);

});

function updateCaptainOrVicecaptain(iuser, iplayer, mytype)
{
  var caporvice = (mytype == is_Captain) ? "Captain" : "ViceCaptain";
  Captain.findOne({gid:1, uid: iuser}, function(err, caprec) {
    if (err)
      senderr(DBFETCHERR, err);
    else {
      // if record found then check if captain already selected once (i.e. captain != 0)
      // if record not found create brand new cpatain record since user has made selection 1st time
      if (!caprec)
        caprec = new Captain({ gid: 1, uid: iuser, captain: 0, viceCaptain: 0 });

      // do BASIC validation
      // 1. given role should not have been selected before
      // 2. iplayer should not have been select for other role

      // check if cpatain / vice captain already selected
      // var alreadySet = (mytype == is_Captain) ? (caprec.captain != 0) : (caprec.viceCaptain != 0);
      // console.log(`Status is ${alreadySet}`);
      // if (alreadySet) 
      //   { senderr(,`${caporvice} already selected by user.`); return; }
      
        // now check player already selected for other role
        // this is to make sure that captain and vice captain are not same player
      alreadySet = (mytype == is_Captain) ? (caprec.viceCaptain == iplayer)
                                          : (caprec.captain == iplayer);
      if (alreadySet) 
        { senderr(609,`Same player cannot be Captain as well as Vice Captain.`); return; }

      // Update captain and write it back to database
      if (mytype == is_Captain)
        caprec.captain = iplayer;
      else
        caprec.viceCaptain = iplayer;

      caprec.save(function(err) {
        if (err) senderr(DBFETCHERR,`Could not update ${caporvice}`);
        else  sendok(`${caporvice} updated for user ${iuser}`);
      });
    }
  });
}

function publish_auctionedplayers_r0(userid)
{
  var myfilter;
  if (userid == allUSER)
    myfilter = {gid: 1};
  else
    myfilter = {gid:1, uid: userid};

  Auction.find(myfilter, (err, datalist) => {    
    if (!datalist)
      senderr(DBFETCHERR, err);
    else {
      // filter if players of only specific user is required
        // datalist = _.filter(datalist, (e) => e.uid === userid);

      // make grouping of players per user
      // NEED TO CLEAN UP THIS PIECE OF CODE
      var grupdatalist = _.reduce(datalist, (result, user) => {
        (result[user.uid] || (result[user.uid] = [])).push(user);
        return result;
      }, {});

      sendok(grupdatalist);
    }
  }); 
}

async function publish_auctionedplayers(userid)
{
  var myfilter;
  if (userid == allUSER)
    myfilter = {gid: defaultGroup};
  else
    myfilter = {gid:defaultGroup, uid: userid};

  var datalist = await Auction.find(myfilter);
  if (!datalist) { senderr(DBFETCHERR,err); return; }
  datalist = _.map(datalist, d => _.pick(d, ['uid', 'pid', 'playerName', 'bidAmount']));
  // make grouping of players per user
  // NEED TO CLEAN UP THIS PIECE OF CODE
  var userlist = _.map(datalist, d => _.pick(d, ['uid']));
  userlist = _.uniqBy(userlist, 'uid');
  //console.log(userlist);
  // var grupdatalist = _.reduce(datalist, (result, user) => {
  //   (result[user.uid] || (result[user.uid] = [])).push(user);
  //   return result;
  // }, {});

  var grupdatalist = [];
  userlist.forEach( myuser => {
    var myplrs = _.filter(datalist, x => x.uid === myuser.uid);
    var tmp = {uid: myuser.uid, players: myplrs};
    grupdatalist.push(tmp);
  })
  sendok(grupdatalist);
}


async function publish_users(filter_users)
{
  //console.log(filter_users);
  var ulist = await User.find(filter_users);
  ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
  sendok(ulist);
}

// return true if IPL has started
function ipl_started()
{
  var justnow = new Date();
  var difference = IPL_Start_Date - justnow;
  return (difference <= 0)
}

function sendok(usrmgs) { CricRes.send(usrmgs);}
function senderr(errcode, errmsg) { CricRes.status(errcode).send(errmsg);}
function setHeader() {
  CricRes.header("Access-Control-Allow-Origin", "*");
  CricRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;

async function showGroupMembers(igroup)
{
  gmlist = await GroupMember.find({gid: igroup});
  var userlist = _.map(gmlist, 'uid');      // [12, 14, 16, 18]
  publish_users({ uid: { $in: userlist } });
}


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