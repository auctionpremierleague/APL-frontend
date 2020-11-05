var router = express.Router();
var GroupRes;
var _group = 1;
var _tournament = "";
/* GET users listing. */

const fetchBalance = async () => {
  var userFilter = { gid: _group };

  let gmRec = await GroupMember.find(userFilter);
  gmRec = _.sortBy(gmRec, 'uid');

  var auctionList = await Auction.find({ gid: _group });
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

  return balanceDetails;
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

router.get('/close/:groupid/:ownerid', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid } = req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  if (ownerid != "9") { senderr(624, `User ${ownerid} is not owner of Group 1`); return; }

  IPLGroup.findOne({ gid: 1 }, (err, gdoc) => {
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {
      console.log(gdoc);
      gdoc.tournamentOver = true;
      gdoc.save();
      sendok(true);
    }
  });
});

router.get('/getauctionstatus/:groupid', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }

  IPLGroup.findOne({ gid: 1 }, (err, gdoc) => {
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {
      console.log(gdoc);
      sendok(gdoc.auctionStatus);
    }
  });
});

router.get('/setauctionstatus/:groupid/:newstate', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, newstate } = req.params;
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  newstate = newstate.toUpperCase();

  IPLGroup.findOne({ gid: 1 }, async (err, gdoc) => {
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {
      console.log(gdoc);
      var aplayer = gdoc.auctionPlayer;
      switch (gdoc.auctionStatus) {
        case "PENDING":
          if (newstate.substring(0, 3) != "RUN") {
            senderr(625, `Invalid auction state ${newstate}`);
            return;
          }

          newstate = "RUNNING";

          const playerList = await Player.find({});
          const socket = app.get("socket");

          const balanceDetails = await fetchBalance();

          socket.emit("playerChange",   playerList[0], balanceDetails )

          socket.broadcast.emit('playerChange', playerList[0], balanceDetails );
          aplayer = playerList[0].pid;
          break;
        case "RUNNING":
          if (newstate.substring(0, 3) != "OVE") {
            senderr(625, `Invalid auction state ${newstate}`);
            return;
          }
          newstate = "OVER";
          break;
        case "OVER":
          if (newstate.substring(0, 3) != "OVE") {
            senderr(625, `Invalid auction state ${newstate}`);
            return;
          }
          newstate = "OVER";
          break;
      }
      gdoc.auctionStatus = newstate;
      gdoc.auctionPlayer = aplayer;
      gdoc.save();
      sendok("Auction Status Updated");
    }
  });
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

router.get('/getauctionplayer/:groupid', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid } = req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }

  IPLGroup.findOne({ gid: 1 }, async (err, gdoc) => {
  
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {
      if (gdoc.auctionStatus === "RUNNING") {
        const playerDetails = await Player.find({pid:gdoc.auctionPlayer});
        const socket = app.get("socket");

        const balanceDetails = await fetchBalance();

        console.log(balanceDetails);
        socket.emit("playerChange", playerDetails[0], balanceDetails )

        socket.broadcast.emit('playerChange', playerDetails[0], balanceDetails );
      }
  
      sendok(gdoc.auctionPlayer.toString());
    }
  });
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

router.get('/add/:groupid/:ownerid/:userid', function (req, res, next) {
  GroupRes = res;
  setHeader();

  var { groupid, ownerid, userid } = req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  if (ownerid != "9") { senderr(624, `User ${ownerid} is not owner of Group 1`); return; }

  igroup = parseInt(groupid);
  if (isNaN(igroup)) { senderr(621, "Invalid group"); return; }
  iowner = parseInt(ownerid);
  if (isNaN(iowner)) { senderr(622, "Invalid owner"); return; }
  iuser = parseInt(userid);
  if (isNaN(iuser)) { senderr(623, "Invalid user"); return; }

  User.findOne({ uid: iuser }, (err, udoc) => {
    if (err)
      senderr(DBFETCHERR, err);
    else if (!udoc)
      senderr(623, "Invalid user");
    else {
      GroupMember.findOne({ gid: 1, uid: iuser }, (err, gmdoc) => {
        if (err)
          senderr(DBFETCHERR, err);
        else if (gmdoc)
          senderr(624, "User already added to group 1");
        else {
          //console.log("Valid USer");              
          //  confirmed that Group 1 exists
          //  confirmed that owner of the group is correct
          //  confirmed that new user is correct                        
          //var myamount = 1000;
          var gmrec = new GroupMember({
            gid: 1,
            uid: iuser,
            userName: udoc.userName,
            balanceAmount: GROUP1_MAXBALANCE
          });
          gmrec.save(function (err) {
            if (err) { senderr(DBFETCHERR, "Unable to added user to Group 1"); }
            else { sendok(`Added user ${iuser} to Group 1`); }
          });
        }
      });
    }
  });
}); // end of get

// requred duting sign in
// window.localStorage.setItem("uid", response.data)
// window.localStorage.setItem("gid", "1");
// window.localStorage.setItem("groupName", "Friends of Happy Home Society");
// window.localStorage.setItem("tournament", "IPL2020");
router.get('/default/:myUser', async function (req, res, next) {
  GroupRes = res;
  setHeader();
  var {myUser}=req.params;

  // get user rec
  var userRec = await User.findOne({uid: myUser});
  if (!userRec) { senderr(623, "Invalid user"); return; }

  // currently set member of group 1
  // var myGmRec = await GroupMember.find({uid: myUser}).limit(-1).sort({ "gid": -1 });
  var ttt = await GroupMember.findOne({uid: myUser, gid: 1});
  // console.log(ttt);
  var myGmRec = [];
  myGmRec.push(ttt);

  var myData = {uid: myUser, gid: 0, displayName: "", groupName: "", tournament: "", ismember: false, admin: false};
  if (myGmRec.length > 0) {
    // console.log(myGmRec[0].gid);
    var myGroup = await IPLGroup.findOne({gid: myGmRec[0].gid});
    // console.log(myGroup);
    // myData.uid = myGmRec[0].uid;
    myData.gid = myGmRec[0].gid;
    myData.displayName = myGmRec[0].displayName;
    myData.groupName = myGroup.name;
    myData.tournament = myGroup.tournament;
    myData.admin = (myUser == myGroup.owner);
    myData.ismember = true;
  } else {
    // not a member of any group. Just check if
    var myGroup = await IPLGroup.find({owner: myUser}).limit(-1).sort({"gid": -1});
    if (myGroup.length > 0) {
      myData.gid = myGroup[0].gid
      myData.displayName = myGroup[0].displayName;
      myData.groupName = myGroup[0].name;
      myData.tournament = myGroup[0].tournament;
      myData.admin = true;
      myData.ismember = false;    // owner but not member. Remember Apurva
    }
  }
  sendok(myData);
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

  var iowner = 0;
  if (!isNaN(iowner)) {
    iowner = parseInt(ownerid);
    var tmp = await User.find({ uid: iowner });
    if (tmp.length === 0) iowner = 0;
  }
  if (iowner === 0) { senderr(622, `Invalid owner ${ownerid}`); return; }

  if (isNaN(maxbid)) { senderr(627, `Invalid max bid amount ${maxbid}`); return; }
  var imaxbid = parseInt(maxbid);

  var tmp = await Tournament.find({ name: mytournament.toUpperCase() })
  if (tmp.length === 0) { senderr(628, `Invalid tournament ${mytournament}`); return; }

  //Goods.find({}).sort({ price: 1 }).limit(1).then(goods => goods[0].price);
  var maxGid = await IPLGroup.find({}).sort({ gid: -1 }).limit(1);
  var myRec = new IPLGroup();
  //console.log(maxGid);
  myRec.gid = maxGid[0].gid + 1;
  myRec.name = groupName;
  myRec.owner = iowner;
  myRec.maxBidAmount = imaxbid;
  myRec.tournament = mytournament;
  myRec.auctionStatus = "PENDING";
  myRec.auctionPlayer = 0;
  myRec.save();
  sendok(myRec);
}); // end of get

// who is the owner of the group. Returns user record of the owner
function owneradmin() {
  let igroup = 1;   // currently only group 1 supported
  IPLGroup.findOne({ gid: igroup }, (err, grprec) => {
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

  // // check if valid user
  // var iuser = allUSER;
  // var ufilter = {}
  // if (userid.toUpperCase() != "ALL") {
  //   if (isNaN(userid)) { senderr(623, `Invalid user id ${userid}`); return;}
  //   iuser = parseInt(userid);
  //   ufilter = {uid: iuser}
  // }
  // var myUsers = await User.find(ufilter)
  // var myGroups = await GroupMember.find ({enable: true});
  // var groupData = [];
  // myUsers.forEach(u => {
  //   var tmp = _.filter(myGroups, x => x.uid === u.uid);
  //   if (tmp.length > 0) {
  //     // const newArr = _.map(arr, o => _.extend({married: false}, o));
  //     // myindex = _.findIndex(myteams, (x) => { return x.name.toUpperCase() === myTeam2});
  //     tmp = _.map(tmp, x => _.extend({default: false}, x));
  //     if (u.defaultGroup > 0) {
  //       var idx = _.findIndex(tmp, (x) => { return} )   
  //     }
  //   }
  // });
  // my
  // myGroups = _.sortBy(myGroups, 'uid').reverse();

  // // sort to key default group at the top
  // if (myUser.defaultGroup > 0) {
  //   var tmp1 = _.filter(myGroups, x => x.gid === myUser.defaultGroup )
  //   _.remove(myGroups, {'gid':  myUser.defaultGroup});
  //   myGroups = tmp1.concat(myGroups);
  // } 

  // sendok(myGroups);
  sendok("Under develoment");
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
  console.log(maxStat);
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

  // console.log(mymatch[0]);
  var difference = 1;   // make it positive if no match schedule
  if (mymatch.length > 0) {
    var firstMatchStart = mymatch[0].matchStartTime;  
    firstMatchStart.setHours(firstMatchStart.getHours() - 1)
    difference = firstMatchStart - justnow;
  }
  return (difference <= 0) ? `${groupRec.tournament} has started!!!! Cannot set Captain/Vice Captain` : "";
}



function senderr(errcode, msg) { GroupRes.status(errcode).send(msg); }
function sendok(msg) { GroupRes.send(msg); GroupRes.end(); }
function setHeader() {
  GroupRes.header("Access-Control-Allow-Origin", "*");
  GroupRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

}
module.exports = router;