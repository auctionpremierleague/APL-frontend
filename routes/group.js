const { ConnectionBase } = require("mongoose");

var router = express.Router();
var GroupRes;
/* GET users listing. */

const fetchBalance = async (groupid) => {
  let gmRec = await GroupMember.find({ gid: groupid });
  gmRec = _.sortBy(gmRec, 'uid');

  var auctionList = await Auction.find({ gid: groupid });
  var balanceDetails = [];

  gmRec.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = 1000 - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.userName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });
  return _.sortBy(balanceDetails, 'userName');
}

router.use('/', function (req, res, next) {
  GroupRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; };

  if (req.url == '/')
    publish_groups({});
  else
    next('route');
});

router.get('/close/:groupid/:ownerid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid } = req.params;
  // groupAction = groupAction.toLowerCase();
  // if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  // if (ownerid != "9") { senderr(624, `User ${ownerid} is not owner of Group 1`); return; }

  gdoc = await IPLGroup.findOne({ gid: groupid });
  if (!gdoc) {senderr(DBFETCHERR, "Could not fetch Group record"); return; }

  if (gdoc.owner == ownerid) { 
    // console.log(gdoc);
    gdoc.tournamentOver = true;
    gdoc.save();
    sendok(true);
  } else {
    
  }
});

router.get('/gettournamentmax/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;
  // groupAction = groupAction.toLowerCase();
  var groupRec = await IPLGroup.findOne({ gid: groupid });
  if (!groupRec) { senderr(621, "Invalid Group"); return; }

  var maxRec = {maxRunPid: 0, maxRunPlayer: "", maxRunValue: 0,
                maxWicketPid: 0, maxWicketPlayer: "", maxWicketValue: 0};
  var tournamentStat = mongoose.model(groupRec.tournament, StatSchema);
  var allRecs = await tournamentStat.find({});
  if (allRecs.length > 0) {
    var myPlayers = _.map(allRecs, 'pid');
    var myPlayers = _.uniq(myPlayers);
    var allPlayerInfo = await Player.find({pid: {$in: myPlayers}});
    console.log(allPlayerInfo);
    var myData = [];
    myPlayers.forEach(myPid => {
      var tmp = _.filter(allRecs, x => x.pid === myPid);
      var pRec = _.filter(allPlayerInfo, x => x.pid === myPid);   //   await Player.findOne({pid: myPid});
      myData.push({pid: myPid, playerName: pRec[0].name, 
          totalRun: _.sumBy(tmp, 'run'), 
          totalWicket: _.sumBy(tmp, 'wicket')})
    })
    myData = _.sortBy(myData, x => x.totalRun).reverse();
    maxRec.maxRunPid = myData[0].pid;
    maxRec.maxRunPlayer = myData[0].playerName;
    maxRec.maxRunValue = myData[0].totalRun;

    myData = _.sortBy(myData, x => x.totalWicket).reverse();
    maxRec.maxWicketPid = myData[0].pid;
    maxRec.maxWicketPlayer = myData[0].playerName;
    maxRec.maxWicketValue = myData[0].totalWicket;
  }
  sendok(maxRec);
});


function sendDataToClient(groupid, player, balance) {
  var myList = _.filter(connectionArray, x => x.gid == groupid && x.page === "AUCT");
  console.log(myList);
  myList.forEach(x => {
    io.to(x.socketId).emit('playerChange', player, balance);
  });
}



router.get('/getauctionstatus/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;
  // groupAction = groupAction.toLowerCase();
  // if (groupid != "1") { senderr(621, "Invalid Group"); return; }

    var gdoc = await IPLGroup.findOne({ gid: groupid });  
    if (!gdoc) {senderr(DBFETCHERR, "Could not fetch Group record"); return; }
    // // if ((gdoc.auctionStatus === "RUNNING")) {
    //   const playerList = await Player.find({pid: gdoc.auctionPlayer});
    //   const balanceDetails = await fetchBalance(groupid);
    //   // console.log(`In Get Status: length is ${playerList.length}`);
    //   sendDataToClient(groupid, playerList[0], balanceDetails);
      sendok(gdoc.auctionStatus);
  });



router.get('/setauctionstatus/:groupid/:newstate', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var { groupid, newstate } = req.params;
  var stateReq = newstate.toUpperCase().substring(0,3);

  var gdoc = await IPLGroup.findOne({ gid: groupid });
  if (!gdoc) { 
    senderr(621, `Invalid group ${groupid}`); 
    return 
  }


  // console.log(gdoc);
  var aplayer = gdoc.auctionPlayer;
  switch (gdoc.auctionStatus) {
    case "PENDING":
      if (stateReq != "RUN") {
        senderr(625, `Invalid auction state ${newstate}`);
        return;
      }
      newstate = "RUNNING";

      const playerList = await Player.find({tournament: gdoc.tournament});
      const balanceDetails = await fetchBalance(groupid);
      // const socket = app.get("socket");
      // console.log(playerList[0]);
      // socket.emit("playerChange",   playerList[0], balanceDetails )
      // socket.broadcast.emit('playerChange', playerList[0], balanceDetails );
      // var aucDataRec = _.find(auctioData, x => x.gid == groupid);
      // if (!aucDataRec) {
      //   aucDataRec = {gid: groupid, player: playerList[0], balance: balanceDetails };
      sendDataToClient(groupid, playerList[0], balanceDetails);
      //   auctioData.push(aucDataRec);
      // } else {
      //   aucDataRec.player = playerList[0];
      //   aucDataRec.balance = balanceDetails;
      // }
      // console.log("Hello1=============== Start")
      // console.log(auctioData);
      // console.log("Hello1--------------End")
      // clientUpdateCount = CLIENTUPDATEINTERVAL+1;
      aplayer = playerList[0].pid;
      break;
    case "RUNNING":
      if (stateReq != "OVE") {
        senderr(625, `Invalid auction state ${newstate}`);
        return;
      }
      newstate = "OVER";
      break;
    case "OVER":
      if (stateReq != "OVE") {
        senderr(625, `Invalid auction state ${newstate}`);
        return;
      }
      newstate = "OVER";
      break;
  }
  gdoc.auctionStatus = newstate;
  gdoc.auctionPlayer = aplayer;
  gdoc.currentBidUid = 0;
  gdoc.currentBidUser = "";
  gdoc.save();
  sendok(aplayer.toString());
});


router.get('/getfirstmatch/:groupid', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  console.log("Hello");
  var { groupid } = req.params;
  if (isNaN(groupid))  { senderr(621, "Invalid Group"); return; }
  var igroup = parseInt(groupid);
  var mygroup = await IPLGroup.findOne({ gid: igroup });
  if (!mygroup) { senderr(621, "Invalid Group"); return; }
  var mymatch = await CricapiMatch.find({tournament: mygroup.tournament}).limit(1).sort({ "matchStartTime": 1 });
  console.log(mymatch);
  sendok(mymatch);
});

router.get('/getauctionplayer/:groupid',  async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var { groupid } = req.params;

  var gdoc = await IPLGroup.findOne({ gid: groupid });
  if (!gdoc) { senderr(621, `Invalid Group ${groupid}`); return; }

  if (gdoc.auctionStatus === "RUNNING") {
    const playerDetails = await Player.find({pid:gdoc.auctionPlayer});
    const socket = app.get("socket");
    const balanceDetails = await fetchBalance(groupid);

    // console.log(balanceDetails);
    socket.emit("playerChange", playerDetails[0], balanceDetails )
    socket.broadcast.emit('playerChange', playerDetails[0], balanceDetails );
  }
  sendok(gdoc.auctionPlayer.toString());
});


router.get('/setauctionplayer/:groupid/:playerId', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, playerId } = req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  if (isNaN(playerId)) { senderr(626, `Invalid Player ${playerId}`); return; }
  iplayer = parseInt(playerId);

  IPLGroup.findOne({ gid: 1 }, async (err, gdoc) => {
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {

      if (gdoc.auctionStatus != "RUNNING") {
        senderr(626, "Cannot update auction Player. Auction is not running");
      } else {

       


        gdoc.auctionPlayer = iplayer;
        gdoc.save();
        sendok(gdoc.auctionPlayer.toString());
      }
    }
  });
});

router.get('/add/:groupid/:ownerid/:userid', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid, userid } = req.params;
  // igroup = parseInt(groupid);
  // if (isNaN(igroup)) { senderr(621, "Invalid group"); return; }
  // iowner = parseInt(ownerid);
  // if (isNaN(iowner)) { senderr(622, "Invalid owner"); return; }
  // iuser = parseInt(userid);
  // if (isNaN(iuser)) { senderr(623, "Invalid user"); return; }

  var gdoc = await IPLGroup({gid: groupid});
  if (!gdoc)  { senderr(621, "Invalid group"); return; }
  if (gdoc.owner !== ownerid) { senderr(624, `User ${ownerid} is not owner of Group ${groupid}`); return; }

  var udoc = await User.findOne({ uid: userid });
  if (!uoc) { senderr(623, "Invalid user"); return; };

  var gmdoc = await GroupMember.findOne({ gid: gdoc.gid, uid: udoc.uid });
  if (gmdoc) {senderr(624, `User already member to group ${groupid}`); return; }

  //console.log("Valid USer;");              
  //  confirmed that Group  exists
  //  confirmed that owner of the group is correct
  //  confirmed that new user is correct                        
  //var myamount = 1000;
  // gid: Number,
  // uid: Number,
  // userName: String,
  // balanceAmount: Number,        // balance available to be used for bid
  // displayName: String,
  // enable: Boolean

  var gmrec = new GroupMember({
    gid: gdoc.gid,
    uid: udoc.uid,
    userName: udoc.displayName,
    balanceAmount: GROUP1_MAXBALANCE,
    displayName: udoc.displayName,      // franchise name as per user
    enable: true
  });
  gmrec.save();
  sendok(`Added user ${userid}; to Group ${groupid}`);
}); // end of get

router.get('/owner', function (req, res, next) {
  GroupRes = res;
  setHeader();

  owneradmin();
});

router.get('/owner', function (req, res, next) {
  GroupRes = res;
  setHeader();

  owneradmin();
});


router.get('/create/:groupName/:ownerid/:maxbid/:mytournament', async function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupName, ownerid, maxbid, mytournament } = req.params;

  var tmp = await IPLGroup.find({});
  var tmp = _.filter(tmp, x => x.name.toUpperCase() === groupName.toUpperCase());
  if (tmp.length > 0) { senderr(629, `Duplicate Group name ${groupName}`); return; }

  // var iowner = 0;
  // if (!isNaN(iowner)) {
  //   iowner = parseInt(ownerid);
  //   var tmp = await User.find({ uid: iowner });
  //   if (tmp.length === 0) iowner = 0;
  // }
  if (isNaN(maxbid)) { senderr(627, `Invalid max bid amount ${maxbid}`); return; }

  var ownerRec = await User.findOne({uid: ownerid});
  if (!ownerRec) { senderr(622, `Invalid owner ${ownerid}`); return; }

  var tmp = await Tournament.find({ name: mytournament.toUpperCase() })
  if (tmp.length === 0) { senderr(628, `Invalid tournament ${mytournament}`); return; }

  //Goods.find({}).sort({ price: 1 }).limit(1).then(goods => goods[0].price);
  var maxGid = await IPLGroup.find({}).sort({ gid: -1 }).limit(1);
  var myRec = new IPLGroup();
  //console.log(maxGid);
  // gid: Number,
  // name: String,
  // owner: Number,
  // maxBidAmount: Number,
  // tournament: String,
  // auctionStatus: String,
  // auctionPlayer: Number,
  // auctionBid: Number,
  // currentBidUid: Number,
  // currentBidUser: String,
  // enable: Boolean
  myRec.gid = maxGid[0].gid + 1;
  myRec.name = groupName;
  myRec.owner = ownerRec.uid;
  myRec.maxBidAmount = maxbid;
  myRec.tournament = mytournament;
  myRec.auctionStatus = "PENDING";
  myRec.auctionPlayer = 0;
  myRec.auctionBid = 0;
  myRec.currentBidUid = 0;
  myRec.currentBidUser = 0;
  myRec.enable = true;
  myRec.save();
  sendok(myRec);
}); // end of get

// who is the owner of the group. Returns user record of the owner
function owneradmin() {
  let igroup = 1;   // currently only group 1 supported
  IPLGroup.findOne({ gid: 1 }, (err, grprec) => {
    if (!grprec) { senderr(621, "Invalid group"); return; }
    //console.log(grprec);
    User.findOne({ uid: grprec.owner }, (err, userrec) => {
      if (!userrec) { senderr(DBFETCHERR, `Could fetch record of user ${grprec.uid}`); return; }
      sendok(userrec);
    });
  });
};

router.get('/test', function (req, res, next) {
  GroupRes = res;
  setHeader();

  update_tournament_max(1);
});

// requred duting sign in
// window.localStorage.setItem("uid", response.data)
// window.localStorage.setItem("gid", "1");
// window.localStorage.setItem("groupName", "Friends of Happy Home Society");
// window.localStorage.setItem("tournament", "IPL2020");

router.get('/setdefaultgroup/:myUser/:myGroup', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser, myGroup}=req.params;

  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }

  // var gmRec = await IPLGroup.findOne({gid: 2, uid: 8});
  var gmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (!gmRec) { senderr(624, "Invalid Group"); return; }

  userRec.defaultGroup = myGroup;
  userRec.save();
  sendok("OK");
});

router.get('/setfranchisename/:myUser/:myGroup/:myDisplayName', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser, myGroup, myDisplayName}=req.params;

  var gmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (gmRec) {
    gmRec.displayName = myDisplayName
    console.log(gmRec);
    gmRec.save();
    sendok("OK");
  } else { 
    senderr(624, "Invalid Group"); 
  }
});

router.get('/getfranchisename/:myUser/:myGroup', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser, myGroup, myDisplayName}=req.params;

  var gmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (gmRec) {
    console.log(gmRec);
    sendok(gmRec.displayName);
  } else { 
    senderr(624, "Invalid Group"); 
  }
});

router.get('/default/:myUser', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser}=req.params;

  // get user rec
  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }

  var myGmRec;
  if (userRec.defaultGroup > 0)
    myGmRec = await GroupMember.find({uid: userRec.uid, gid: userRec.defaultGroup});
  else
    myGmRec = await GroupMember.find({uid: myUser}).limit(-1).sort({ "gid": -1 });
  var myData = {uid: myUser, gid: 0, displayName: "", groupName: "", tournament: "", admin: false};
  if (myGmRec.length > 0) {
    // console.log(myGmRec[0].gid);
    var myGroup = await IPLGroup.findOne({gid: myGmRec[0].gid});
    myData.gid = myGmRec[0].gid;
    myData.userName = userRec.displayName;
    myData.displayName = myGmRec[0].displayName;
    myData.groupName = myGroup.name;
    myData.tournament = myGroup.tournament;
    myData.admin = (myUser == myGroup.owner);
  } 
  // console.log(myData);
  sendok(myData);
});


// requred duting change of current group
// window.localStorage.setItem("uid", response.data)
// window.localStorage.setItem("gid", "1");
// window.localStorage.setItem("groupName", "Friends of Happy Home Society");
// window.localStorage.setItem("tournament", "IPL2020");
router.get('/current/:myGroup/:myUser', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myGroup, myUser}=req.params;

  // get user rec
  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }
  var groupRec = await IPLGroup.findOne({gid: myGroup})
  if (!groupRec) { senderr(621, `Invalid group ${myGroup}`); return; }

  var myData = {uid: myUser, gid: myGroup, displayName: "", groupName: "", tournament: "", ismember: false, admin: false};
  myData.groupName = groupRec.name;
  myData.tournament = groupRec.tournament;
  myData.admin = (myUser == groupRec.owner);

  var myGmRec = await GroupMember.findOne({gid: myGroup, uid: myUser});
  if (myGmRec) {
    myData.displayName = myGmRec.displayName;
    myData.ismember = true;
  } else {
      myData.displayName = myGroup.displayName;
      myData.ismember = false;    // owner but not member. Remember Apurva
  }
  sendok(myData);
});

router.get('/gamestarted/:mygroup', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {mygroup}=req.params;
  if (isNaN(mygroup)) { return senderr(621, `Invalid group ${mygroup}`); return; }
  var igroup = parseInt(mygroup);
  var msg = await tournament_started(igroup);
  sendok(msg);
});

// list of group of which user is the member
router.get('/memberof/:userid', async function(req, res, next) {
  GroupRes = res;
  setHeader();
  var {userid}=req.params;

  // check if valid user
  var iuser = allUSER;
  var ufilter = {}
  var gfilter = {enable: true};
  if (userid.toUpperCase() != "ALL") {
    if (isNaN(userid)) { senderr(623, `Invalid user id ${userid}`); return;}
    iuser = parseInt(userid);
    ufilter = {uid: iuser}
    gfilter = {uid: iuser, enable: true};
  }
  // console.log(`${userid} is valid`)
  var myUsers = await User.find(ufilter)
  var myGmRec = await GroupMember.find (gfilter);
  var allGroups = await IPLGroup.find({});
  // console.log(allGroups);
  var groupData = [];
  let uidx;
  for(uidx=0; uidx < myUsers.length; ++uidx) {
    let u = myUsers[uidx];
    // console.log(u);
    var gData = [];
    var tmp = _.filter(myGmRec, x => x.uid === u.uid);
    let i;
    for(i=0; i<tmp.length; ++i) {
      let gm = tmp[i];
      var grp = _.find(allGroups, x => x.gid === gm.gid);
      var isDefault = gm.gid === u.defaultGroup;
      var adminSts = (gm.uid === grp.owner) //? "Admin" : "";
      var xxx =  { gid: gm.gid, displayName: gm.displayName, 
        groupName: grp.name, tournament: grp.tournament, 
        admin: adminSts, defaultGroup: isDefault};
      // console.log(grp);
      // console.log(gm);
      // console.log(xxx);
      // if (gm.gid === u.defaultGroup) xxx.default = "Default";
      gData.push(xxx)
    }
    gData = _.sortBy(gData, x => x.gid).reverse();
    // console.log(gData);
    groupData.push({ uid: u.uid, userName: u.userName, displayName: u.displayName, groups: gData});
  }
  // console.log("about to send ok")
  sendok(groupData);
});

async function update_tournament_max(groupno) {
  // first find maximum of run scored by batsman and wickets taken by bowler 
  // get list of players beloging to group
  //var auctionList = await Auction.find({gid: groupno});
  //var allplayers = _.map(auctionList, 'pid');
  var playersList = await Player.find({});
  var allplayers = _.map(playersList, 'pid');
  //ar maxRuns, maxWickets, maxRunsPlayer, maxWicketsPlayer;
  var statList = await Stat.find({ pid: { $in: allplayers } });
  var maxStat = [];
  allplayers.forEach(mypid => {
    var playerStat = _.filter(statList, x => x.pid == mypid);
    if (playerStat.length === 0) return;
    var myruns = _.sumBy(playerStat, 'run');
    var mywkt = _.sumBy(playerStat, 'wicket');
    if ((myruns + mywkt) === 0) return;
    maxStat.push({ pid: mypid, run: myruns, wicket: mywkt });
  });
  // console.log(maxStat);
  // we now have players total of run an wickets.  Get max run and wicket
  var maxRunRec = _.maxBy(maxStat, o => o.run);
  var maxWicketRec = _.maxBy(maxStat, o => o.wicket);
  // get all records with max runs and max wickets
  var allMaxRunRec = _.filter(maxStat, x => x.run == maxRunRec.run);
  var allMaxWicketRec = _.filter(maxStat, x => x.wicket == maxWicketRec.wicket);
  sendok(allMaxWicketRec);
}

function publish_groups(filter_groups) {
  IPLGroup.find(filter_groups, (err, glist) => {
    if (glist)
      sendok(glist);
    else
      senderr(DBFETCHERR, "Unable to fetch Groups from database");
  });
}

// return true if IPL has started
async function tournament_started(mygroup) {
  var justnow = new Date();
  var groupRec = await IPLGroup.findOne({gid: mygroup})
  if (!groupRec) return("Invalid Group");
  var mymatch = await CricapiMatch.find({tournament: groupRec.tournament}).limit(1).sort({ "matchStartTime": 1 });
  // console.log(mymatch.length);
  var difference = 1;   // make it positive if no match schedule
  if (mymatch.length > 0) {
    var firstMatchStart = mymatch[0].matchStartTime;  
    firstMatchStart.setHours(firstMatchStart.getHours() - 1)
    difference = firstMatchStart - justnow;
  }
  // console.log(difference);
  return (difference <= 0) ? `${groupRec.tournament} has started!!!! Cannot set Captain/Vice Captain` : "";
}

function senderr(errcode, msg) { GroupRes.status(errcode).send(msg); }
function sendok(msg) { GroupRes.send(msg); GroupRes.end(); }
function setHeader() {
  GroupRes.header("Access-Control-Allow-Origin", "*");
  GroupRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

}
module.exports = router;