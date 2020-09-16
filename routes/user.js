const { route, use } = require(".");
router = express.Router();

const allUSER = 99999999;
const is_Captain = true;
const is_ViceCaptain = false;
let CricRes;
var _group;
var _tournament;


/* GET all users listing. */
router.get('/', function (req, res, next) {
  CricRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  if (req.url == "/")
    publish_users({});
  else
    next('route');
});


// get all user of group
router.get('/group', async function (req, res, next) {
  CricRes = res;
  setHeader();
  //_group = defaultGroup;
  showGroupMembers(1);
});

// get users belonging to group "mygroup"
router.get('/group/:mygroup', async function (req, res, next) {
  CricRes = res;
  setHeader();

  var { mygroup } = req.params;
  if (isNaN(mygroup)) { senderr(601, `Invalid group number ${mygroup}`); return; }
  showGroupMembers(parseInt(mygroup));
});

//=============== SIGNUP
router.get('/signup/:userName/:userParam', function (req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});

//=============== RESET
router.get('/reset/:userName/:userParam', function (req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});

//=============== LOGIN
router.get('/login/:userName/:userParam', function (req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});


//==================== internally called for signup, login and reset
router.get('/internal/:userAction/:userName/:userParam', function (req, res, next) {
  CricRes = res;
  setHeader();

  var { userAction, userName, userParam } = req.params;
  userAction = userAction.toLowerCase();
  userName = userName.toLowerCase().replace(/\s/g, "");
  //if (!db_connection) return;

  User.findOne({ userName }, function (err, urec) {
    if (err)
      senderr(DBFETCHERR, err);
    else {
      switch (userAction) {
        case "login":
          if ((urec) && (urec.password == userParam))
            sendok(urec.uid.toString());
          else
            senderr(602, "Invalid User name or password");
          break;
        case "reset":
          if (urec) {
            urec.password = userParam;
            urec.save(function (err) {
              //console.log(err);
              if (err) senderr(DBFETCHERR, "Could not reset password");
              else sendok(urec.uid.toString());
            });
          } else
            senderr(602, "Invalid User name or password");
          break;
        case "setdisplay":
          if (urec) {
            console.log(urec);
            urec.displayName = userParam;
            urec.save(function (err) {
              //console.log(err);
              if (err) senderr(DBFETCHERR, "Could not update display name");
              else sendok(urec.uid.toString());
            });
          } else
            senderr(602, "Invalid User name or password");
          break;
        case "signup":
          if (!urec) {
            User.find().limit(1).sort({ "uid": -1 }).exec(function (err, doc) {
              if (err) senderr(DBFETCHERR, err);
              else {
                var user1 = new User({
                  uid: doc[0].uid + 1,
                  userName: userName,
                  displayName: userName,
                  password: userParam,
                  status: true
                });
                user1.save(function (err) {
                  if (err)
                    senderr(DBFETCHERR, "Unable to add new User record");
                  else
                    sendok(user1.uid.toString());
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
router.get('/captain/:myuser/:myplayer', function (req, res, next) {
  CricRes = res;
  setHeader();

  if (ipl_started()) {
    senderr(604, "IPL has started!!!! Cannot set Captain");
    return;
  }
  var { myuser, myplayer } = req.params;
  var iuser = parseInt(myuser);
  var iplayer = parseInt(myplayer);
  //var igroup = _group;

  if (isNaN(iuser)) { senderr(605, "Invalid user"); return; }
  if (isNaN(iplayer)) { senderr(606, "Invalid player"); return; }

  Auction.find({ gid: _group, uid: iuser, pid: iplayer }).countDocuments(function (err, count) {
    if (err)
      senderr(DBFETCHERR, err);
    else if (count == 0)
      senderr(607, "Player " + iplayer + " not purchased by user " + iuser);
    else {
      updateCaptainOrVicecaptain(iuser, iplayer, is_Captain);
    }
  });
});

// select vice caption for the user (currently only group 1 supported by default)
router.get('/vicecaptain/:myuser/:myplayer', function (req, res, next) {
  CricRes = res;
  setHeader();

  if (ipl_started()) {
    senderr(604, "IPL has started!!!! Cannot set Vice Captain");
    return;
  }
  var { myuser, myplayer } = req.params;
  var iuser = parseInt(myuser);
  var iplayer = parseInt(myplayer);

  if (isNaN(iuser)) { senderr(605, "Invalid user"); return; }
  if (isNaN(iplayer)) { senderr(606, "Invalid player"); return; }

  Auction.find({ gid: _group, uid: iuser, pid: iplayer }).countDocuments(function (err, count) {
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

// select caption for the user (currently only group 1 supported by default)
router.get('/getcaptain/:myuser', function (req, res, next) {
  CricRes = res;
  setHeader();

  var { myuser } = req.params;
  var igroup = defaultGroup;

  var myfilter;
  if (myuser.toUpperCase() === "ALL")
    myfilter = { gid: igroup };
  else {
    var iuser = parseInt(myuser);
    if (isNaN(iuser)) { senderr(605, "Invalid user"); return; }
    myfilter = { gid: igroup, uid: iuser };
  }
  publishCaptain(myfilter);
});

// get users balance
// only group 1 supported which is default group
router.get('/balance/:myuser', async function (req, res, next) {
  CricRes = res;
  setHeader();

  var { myuser } = req.params;
  var userFilter = { gid: _group };
  if (myuser.toUpperCase() != "ALL") {
    if (isNaN(myuser)) { senderr(605, "Invalid user " + myuser); return; }
    userFilter = { gid: _group, uid: parseInt(myuser) };
  }
  //console.log(`hello ${iuser}`);
  gmRec = await GroupMember.find(userFilter);
  gmRec = _.sortBy(gmRec, 'uid');

  var auctionList = await Auction.find({ gid: _group });
  var balanceDetails = [];

  gmRec.forEach(gm => {
    //console.log(gm);
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    //console.log(myAuction);
    var myPlayerCount = myAuction.length;
    var mybal = 1000 - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.userName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    })
  })
  sendok(balanceDetails);
})


// get players purchased by me.
// currently only group 1 supported
router.get('/myteam/:userid', function (req, res, next) {
  CricRes = res;
  setHeader();

  var { userid } = req.params;
  let igroup = _group;   // default group 1
  let iuser = (userid.toUpperCase() != "ALL") ? parseInt(userid) : allUSER;
  if (isNaN(iuser))
    senderr(605, `Invalid user ${userid}`);
  else
    publish_auctionedplayers(iuser);

});

router.get('/myteamwocvc/:userid', async function (req, res, next) {
  CricRes = res;
  setHeader();

  var { userid } = req.params;
  let igroup = 2;  //_group;   // default group 1
  if (userid.toUpperCase() === "ALL") userid = allUSER.toString();
  if (isNaN(userid)) { senderr(605, `Invalid user ${userid}`); return; }
  //let iuser = parseInt(userid);
  var PauctionPlayers = Auction.find({gid: igroup});
  allCaptains = await Captain.find({gid: igroup});
  var mycvc = [];
  mycvc = mycvc.concat(_.map(allCaptains, 'captain'));
  mycvc = mycvc.concat(_.map(allCaptains, 'viceCaptain'));
  mycvc = _.uniqBy(mycvc);
  //console.log(mycvc);

  // my remove players who are captain and vice captain
  var auctionPlayers = await PauctionPlayers;
  auctionPlayers = _.filter(auctionPlayers, x => !mycvc.includes(x.pid))

  // if required only for single user then filter
  if (iuser != allUSER)
    auctionPlayers = _.filter(auctionPlayers, x => x.uid == userid);
  sendok(auctionPlayers);

});

// Which group I am the member
// each group will have have the tournament name
router.get('/mygroup/:userid', async function (req, res, next) {
  CricRes = res;
  setHeader();
  var { userid } = req.params;

  var userFilter = {};
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(userid)) { senderr(605, `Invalid user ${userid}`); return; }
    userFilter = { uid: parseInt(userid) };
  }
  var userRec = await User.find(userFilter);
  if (userRec.length === 0) { senderr(605, `Invalid user ${userid}`); return; }
  userRec = _.sortBy(userRec, 'uid');

  // now we have sorted User(s). Sorting is done on UID. get group member list of these users
  var userList = _.map(userRec, 'uid');
  var gmRec = await GroupMember.find({ uid: { $in: userList } });
  gmRec = _.sortBy(gmRec, 'gid');

  var result = [];
  if (gmRec.length > 0) {
    groupList = _.map(gmRec, 'gid');
    var groupRec = await IPLGroup.find({ gid: { $in: groupList } });
    //console.log(groupRec);
    userRec.forEach(u => {
      var memberof = _.filter(gmRec, x => x.uid == u.uid);
      memberof.forEach(gm => {
        //console.log(gm);
        var mygroup = _.filter(groupRec, x => x.gid == gm.gid);
        result.push({
          uid: u.uid,
          userName: u.userName, displayName: u.displayName,
          gid: mygroup[0].gid, groupName: mygroup[0].name,
          tournament: mygroup[0].tournament
        });
      })
    })
  }
  //console.log(result);
  sendok(result);
  // sendok(gmRec);
})

async function updateCaptainOrVicecaptain(iuser, iplayer, mytype) {
  var myplayer = await Player.findOne({ pid: iplayer });
  var caporvice = (mytype == is_Captain) ? "Captain" : "ViceCaptain";
  Captain.findOne({ gid: _group, uid: iuser }, function (err, caprec) {
    if (err)
      senderr(DBFETCHERR, err);
    else {
      // if record found then check if captain already selected once (i.e. captain != 0)
      // if record not found create brand new cpatain record since user has made selection 1st time
      if (!caprec)
        caprec = new Captain({
          gid: _group,
          uid: iuser,
          captain: 0,
          captainName: "",
          viceCaptain: 0,
          viceCaptainName: ""
        });

      alreadySet = (mytype == is_Captain) ? (caprec.viceCaptain == iplayer)
        : (caprec.captain == iplayer);
      if (alreadySet) {
        senderr(609, `Same player cannot be Captain as well as Vice Captain.`);
        return;
      }

      // Update captain and write it back to database
      //console.log(myplayer);
      //console.log(myplayer.name)
      if (mytype == is_Captain) {
        caprec.captain = iplayer;
        caprec.captainName = myplayer.name;
      } else {
        caprec.viceCaptain = iplayer;
        caprec.viceCaptainName = myplayer.name;
      }
      //console.log(caprec);
      caprec.save(function (err) {
        if (err) senderr(DBFETCHERR, `Could not update ${caporvice}`);
        else sendok(`${caporvice} updated for user ${iuser}`);
      });
    }
  });
}


async function publish_auctionedplayers_orig(userid) {
  var myfilter;
  var userFilter;
  if (userid == allUSER) {
    myfilter = { gid: _group };
    userFilter = {};
  } else {
    myfilter = { gid: _group, uid: userid };
    userFilter = { uid: userid }
  }

  var allUsers = await User.find(userFilter);
  var datalist = await Auction.find(myfilter);
  //console.log(datalist);
  if (!datalist) { senderr(DBFETCHERR, err); return; }
  datalist = _.map(datalist, d => _.pick(d, ['uid', 'pid', 'playerName', 'team', 'bidAmount']));

  // make grouping of players per user
  // NEED TO CLEAN UP THIS PIECE OF CODE
  var userlist = _.map(datalist, d => _.pick(d, ['uid']));
  userlist = _.uniqBy(userlist, 'uid');

  var grupdatalist = [];
  userlist.forEach(myuser => {
    //var userRec = await User.findOne({uid: myuser.uid});
    var userRecs = _.filter(allUsers, x => x.uid == myuser.uid);
    var myplrs = _.filter(datalist, x => x.uid === myuser.uid);
 
    var tmp = { uid: myuser.uid, displayName: userRecs[0].displayName, userName: userRecs[0].userName, players: myplrs };

    grupdatalist.push(tmp);
  })
  sendok(grupdatalist);
}

async function publish_auctionedplayers(userid)
{
  var myfilter;
  var userFilter;
  var igroup = _group;

  var myGroup = await IPLGroup({gid: igroup});
  if (!myGroup) { senderr(601, `Invalid group number ${mygroup}`); return; }
  if (isNaN(userid)) { senderr(605, "Invalid user"); return; }

  if (userid == allUSER) { 
    myfilter = {gid: igroup};
    userFilter = {};
  }else {
    myfilter = {gid: igroup, uid: userid};
    userFilter = {uid: userid}
  }

  var PallCaptains = Captain.find(myfilter); 
  var Pgmembers = GroupMember.find({gid: igroup});
  var PallUsers = User.find(userFilter);
  var Pdatalist = Auction.find(myfilter);
  
  var allCaptains = await PallCaptains;
  var allUsers = await PallUsers;
  var datalist = await Pdatalist;
  var gmembers = await Pgmembers;
  //console.log(datalist);

  datalist = _.map(datalist, d => _.pick(d, ['uid', 'pid', 'playerName', 'bidAmount']));
  var userlist = _.map(gmembers, d => _.pick(d, ['uid']));
  if (userid != allUSER)
    userlist = _.filter(userlist, x => x.uid == userid);

  var grupdatalist = [];
  userlist.forEach( myuser => {
    var userRec = _.filter(allUsers, x => x.uid == myuser.uid);
    //console.log(`${userRec}`);
    var myplrs = _.filter(datalist, x => x.uid === myuser.uid);
    // set captain and vice captain
    var caprec = _.find(allCaptains, x => x.uid == myuser.uid);
    if (caprec) {
      var myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.captain;}, 0);
      if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (C)"
      myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.viceCaptain;}, 0);
      if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (VC)"  
    } 

    var tmp = {uid: myuser.uid, 
      userName: userRec[0].userName, displayName: userRec[0].displayName, 
      players: myplrs};
    grupdatalist.push(tmp);
  })
  console.log(grupdatalist.length);
  sendok(grupdatalist);
}

async function publish_users(filter_users) {
  //console.log(filter_users);
  var ulist = await User.find(filter_users);
  ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
  ulist = _.sortBy(ulist, 'uid');
  sendok(ulist);
}

async function publishCaptain(filter_users) {
  console.log(filter_users);
  var ulist = await Captain.find(filter_users);
  ulist = _.map(ulist, o => _.pick(o, ['gid', 'uid',
    'captain', 'captainName',
    'viceCaptain', 'viceCaptainName']));
  sendok(ulist);
}

// return true if IPL has started
function ipl_started() {
  var justnow = new Date();
  var difference = IPL_Start_Date - justnow;
  return (difference <= 0)
}

function sendok(usrmgs) { CricRes.send(usrmgs); }
function senderr(errcode, errmsg) { CricRes.status(errcode).send(errmsg); }
function setHeader() {
  CricRes.header("Access-Control-Allow-Origin", "*");
  CricRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament;
}
module.exports = router;

async function showGroupMembers(groupno) {
  //console.log(_ggroupnoroup);
  gmlist = await GroupMember.find({ gid: groupno });
  var userlist = _.map(gmlist, 'uid');
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