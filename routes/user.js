const { sortedIndexOf } = require("lodash");
const { route, use } = require(".");
router = express.Router();

// const allUSER = 99999999;
const is_Captain = true;
const is_ViceCaptain = false;
const WITH_CVC  = 1;
const WITHOUT_CVC = 2;
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


// get users belonging to group "mygroup"
router.get('/group/:mygroup', async function (req, res, next) {
  CricRes = res;
  setHeader();

  var { mygroup } = req.params;
  if (isNaN(mygroup)) { senderr(601, `Invalid group number ${mygroup}`); return; }
  showGroupMembers(parseInt(mygroup));
});

function getLoginName(name) {
  return name.toLowerCase().replace(/\s/g, "");
}

function getDisplayName(name) {
  var xxx = name.split(" ");
  xxx.forEach( x => { 
    x = x.trim()
    x = x.substr(0,1).toUpperCase() +
      (x.length > 1) ? x.substr(1, x.length-1).toLowerCase() : "";
  });
  return xxx.join(" ");
}


//=============== SIGNUP
router.get('/signup/:uName/:uPassword/:uEmail', async function (req, res, next) {
  CricRes = res;
  setHeader();
  var {uName, uPassword, uEmail } = req.params;
  var isValid = false;
  // if user name already used up
  let myCount = await User.count({ userName: getLoginName(uName) });
  if (myCount > 0) {senderr(602, "User name already used."); return; }
  myCount = await User.count({ email: uEmail });
  if (myCount > 0) {senderr(603, "Email already used."); return; }
  uRec = await User.find().limit(1).sort({ "uid": -1 });
  var user1 = new User({
      uid: uRec[0].uid + 1,
      userName: getLoginName(uName),
      displayName: getDisplayName(uName),
      password: uPassword,
      email: uEmail,
      defaultGroup: 0,
      status: true
    });
  user1.save();
  console.log(user1);
  sendok("OK"); 
})

//=============== RESET
router.get('/reset/:userName/:userParam', function (req, res, next) {
  req.url = "/internal" + req.url;
  next('route');
});

//=============== LOGIN
router.get('/login/:uName/:uPassword', async function (req, res, next) {
  CricRes = res;
  setHeader();
  var {uName, uPassword } = req.params;
  var isValid = false;
  let uRec = await User.findOne({ userName: getLoginName(uName) });
  if (uRec) isValid = (uPassword === uRec.password);
  if (isValid) sendok(uRec.uid.toString());
  else         senderr(602, "Invalid User name or password");
});

//=============== forgot passord. email pwd to user
router.get('/emailpassword/:mailid', async function (req, res, next) {
  CricRes = res;
  setHeader();
  var {mailid} = req.params;
  var isValid = false;
  let uRec = await User.findOne({ email: mailid });
  if (!uRec) {senderr(602, "Invalid email id"); return  }
  
  MYEMAILID='cricketpwd@gmail.com';

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MYEMAILID,
      pass: 'Anob@1989#93'
    }
  });

  var mailOptions = {
    from: MYEMAILID,
    to: 'arunsalgia@gmail.com',
    subject: 'User info from CricDream',
    text: 'That was easy!'
  };

  mailOptions.to = uRec.email;
  mailOptions.text = `Dear User,
  
    Greeting from CricDeam.

    As request by you here is your password.

    Password:  ${uRec.password}


    Regards,
    for Cricdream.`

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      senderr(603, error);
    } else {
      console.log('Email sent: ' + info.response);
      sendok('Email sent: ' + info.response);
    }
  });
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
          if ((urec) && (urec.password == userParam)) {
            sendok(urec.uid.toString());
            sendDashboard = true;         // send dashboard data so that it gets displayed to user
          }
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
router.get('/captain/:myuser/:myplayer', async function (req, res, next) {
  CricRes = res;
  setHeader();
  igroup = _group;

  // check tournament has started
  var myMsg = await ipl_started(igroup);
  if (myMsg != "") {
    senderr(604, myMsg);
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
router.get('/vicecaptain/:myuser/:myplayer', async function (req, res, next) {
  CricRes = res;
  setHeader();
  igroup = _group;

  // check tournament has started
  var myMsg = await ipl_started(igroup);
  if (myMsg != "") {
    senderr(604, myMsg);
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

router.get('/getcaptain/:mygroup/:myuser', async function (req, res, next) {
  CricRes = res;
  setHeader();

  var { mygroup, myuser } = req.params;
  var igroup =  parseInt(mygroup);    // defaultGroup;

  var myfilter;
  if (myuser.toUpperCase() === "ALL")
    myfilter = { gid: igroup };
  else {
    if (isNaN(myuser)) { senderr(605, "Invalid user"); return; }
    var iuser = parseInt(myuser);
    var myMembership = await GroupMember.findOne({gid: igroup, uid: iuser});
    if (!myMembership) { senderr(605, "Invalid user"); return; }
    myfilter = { gid: igroup, uid: iuser };
  }
  publishCaptain(myfilter);
});

// get users balance
// only group 1 supported which is default group
router.get('/balance/:mygroup/:myuser', async function (req, res, next) {
  CricRes = res;
  setHeader();
  var { mygroup, myuser } = req.params;
  var userFilter = (myuser.toUpperCase() !== "ALL") ? { gid: mygroup, uid: myuser }  : { gid: mygroup }

  // console.log(`hello ${myuser}`);
  gmRec = await GroupMember.find(userFilter);
  // gmRec = _.sortBy(gmRec, 'uid');

  var auctionList = await Auction.find({ gid: mygroup });
  var balanceDetails = [];
  gmRec.forEach(gm => {
    //console.log(gm);
    myAuction = _.filter(auctionList, x => x.uid === gm.uid);
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


// get users balance
// only group 1 supported which is default group
// router.get('/balance/:myuser', async function (req, res, next) {
//   CricRes = res;
//   setHeader();

//   var { myuser } = req.params;
//   var userFilter = { gid: _group };
//   if (myuser.toUpperCase() != "ALL") {
//     if (isNaN(myuser)) { senderr(605, "Invalid user " + myuser); return; }
//     userFilter = { gid: _group, uid: parseInt(myuser) };
//   }
//   //console.log(`hello ${iuser}`);
//   gmRec = await GroupMember.find(userFilter);
//   gmRec = _.sortBy(gmRec, 'uid');

//   var auctionList = await Auction.find({ gid: _group });
//   var balanceDetails = [];

//   gmRec.forEach(gm => {
//     //console.log(gm);
//     myAuction = _.filter(auctionList, x => x.uid == gm.uid);
//     //console.log(myAuction);
//     var myPlayerCount = myAuction.length;
//     var mybal = 1000 - _.sumBy(myAuction, 'bidAmount');
//     balanceDetails.push({
//       uid: gm.uid,
//       userName: gm.userName,
//       gid: gm.gid,
//       playerCount: myPlayerCount,
//       balance: mybal
//     })
//   })
//   sendok(balanceDetails);
// })


router.get('/myteam/:userGroup/:userid', function (req, res, next) {
  CricRes = res;
  setHeader();

  var { userGroup, userid } = req.params;
  let igroup = parseInt(userGroup);   //_group;   // default group 1
  let iuser = allUSER;
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(iuser)) { senderr(605, `Invalid user ${userid}`); return; }
    iuser = parseInt(userid);
  }
  publish_auctionedplayers(igroup, iuser, WITH_CVC);

});

// get players purchased by me.
// currently only group 1 supported
router.get('/myteam/:userid', function (req, res, next) {
  CricRes = res;
  setHeader();

  var { userid } = req.params;
  let igroup = _group;   // default group 1
  let iuser = allUSER;
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(iuser)) { senderr(605, `Invalid user ${userid}`); return; }
    iuser = parseInt(userid);
  }
  publish_auctionedplayers(igroup, iuser, WITH_CVC);

});

router.get('/myteamwos/:groupid/:userid', function (req, res, next) {
  CricRes = res;
  setHeader();

  var { groupid, userid } = req.params;
  let igroup = parseInt(groupid);     //  _group;   // default group 1
  let iuser = allUSER;
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(iuser)) { senderr(605, `Invalid user ${userid}`); return; }
    iuser = parseInt(userid);
  }
  publish_auctionedplayers(igroup, iuser, WITHOUT_CVC);

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
      // caprec.save(function (err) {
      //   if (err) senderr(DBFETCHERR, `Could not update ${caporvice}`);
      //   else sendok(`${caporvice} updated for user ${iuser}`);
      // });
      sendok(`${caporvice} updated for user ${iuser}`);
    }
  });
}

async function publish_auctionedplayers(groupid, userid, withOrWithout)
{
  var myfilter;
  var userFilter;

  var myGroup = await IPLGroup({gid: groupid});
  if (!myGroup) { senderr(601, `Invalid group number ${groupid}`); return; }
  if (isNaN(userid)) { senderr(605, "Invalid user"); return; }
  if (userid === allUSER) { 
    myfilter = {gid: groupid};
    userFilter = {};
  }else {
    myfilter = {gid: groupid, uid: userid};
    userFilter = {uid: userid}
  }
  var PallCaptains = Captain.find(myfilter); 
  var Pgmembers = GroupMember.find({gid: groupid});
  var PallUsers = User.find(userFilter);
  var Pdatalist = Auction.find(myfilter);
  
  var allCaptains = await PallCaptains;
  var allUsers = await PallUsers;
  var datalist = await Pdatalist;
  var gmembers = await Pgmembers; 
  //console.log(datalist);

  datalist = _.map(datalist, d => _.pick(d, ['uid', 'pid', 'playerName', 'team', 'bidAmount']));
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
    if (withOrWithout === WITH_CVC) {
      if (caprec) {
        var myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.captain;}, 0);
        if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (C)"
        myidx = _.findIndex(myplrs, (x) => {return x.pid == caprec.viceCaptain;}, 0);
        if (myidx >= 0) myplrs[myidx].playerName = myplrs[myidx].playerName + " (VC)"  
      } 
    }

    var tmp = {uid: myuser.uid, 
      userName: userRec[0].userName, displayName: userRec[0].displayName, 
      players: myplrs};
    grupdatalist.push(tmp);
  })
  grupdatalist = _.sortBy(grupdatalist, 'bidAmount').reverse();
  // console.log(grupdatalist.length);
  sendok(grupdatalist);
}

async function publish_users(filter_users) {
  //console.log(filter_users);
  var ulist = await User.find(filter_users);
  ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName', 'defaultGroup']));
  ulist = _.sortBy(ulist, 'uid');
  sendok(ulist);
}

async function publishCaptain(filter_users) {
  // console.log(filter_users);
  var ulist = await Captain.find(filter_users);
  ulist = _.map(ulist, o => _.pick(o, ['gid', 'uid',
    'captain', 'captainName',
    'viceCaptain', 'viceCaptainName']));
  // console.log(ulist);
  sendok(ulist);
}

// return true if IPL has started
async function ipl_started(mygroup) {
  var justnow = new Date();
  var groupRec = await IPLGroup.findOne({gid: mygroup})
  if (!groupRec) return("Invalid Group");
  var mymatch = await CricapiMatch.find({tournament: groupRec.tournament}).limit(1).sort({ "matchStartTime": 1 });

  // console.log(mymatch[0]);
  var difference = 1;   // make it positive if no match schedule
  if (mymatch.length > 0) {
    var firstMatchStart = mymatch[0].matchStartTime;  
    firstMatchStart.setHours(firstMatchStart.getHours() - 1)
    difference = firstMatchStart - justnow;
  }
  return (difference <= 0) ? `${groupRec.tournament} has started!!!! Cannot set Captain/Vice Captain` : "";
}

function sendok(usrmgs) { CricRes.send(usrmgs); }
function senderr(errcode, errmsg) { CricRes.status(errcode).send({error: errmsg}); }
function setHeader() {
  CricRes.header("Access-Control-Allow-Origin", "*");
  CricRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament;
}
module.exports = router;

async function showGroupMembers(groupno) {
  //console.log(_ggroupnoroup);
  gmlist = await GroupMember.find({ gid: groupno, enable: true });
  // ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName', 'defaultGroup']));
  if (gmlist.length > 0)
    gmlist = _.map(gmlist, o => _.pick(o, ['gid', 'uid', 'userName', 'displayName']));
  // var userlist = _.map(gmlist, 'uid');
  // publish_users({ uid: { $in: userlist } });
  gmlist = _.sortBy(gmlist, 'userName')
  sendok(gmlist);
}
