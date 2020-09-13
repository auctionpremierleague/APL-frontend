router = express.Router();
var PlayerStatRes;
var _group = 0;
var _tournament = "";
const doMaxRun = 1;
const doMaxWicket = 2;

// user these keys in rotation for fetch data from cricapi
const keylist = [				
"O9vYC5AxilYm7V0EkYkvRP5jF9B2","RTf9weNrX8Xn2ts1ksdzAXcuxnE3","H2ObZFee6BVMN5kCjLxYCMwcEp52",
"kAWvFxmpeJZmbtyNeDLXtxUPrAH3","EstH4EqbfEXMKXcS9M83k7cqUs13","ApVnpFFO6kgxTYXVwWQTEeiFVCO2",
"72QuFkQezxf5IdqxV1CtGJrAtcn1","mggoPlJzYFdVbnF9FYio5GTLVD13","AdHGF0Yf9GTVJcofkoRTt2YHK3k1",
"4mtu16sveyTPWgz5ID7ru9liwE12","iEsdTQufBnToUI1xVxWMQF6wauX2","bbdCNNOKBtPnL54mvGSgpToFUlA2",
"AM690XluFdZJ85PYvOP7IxgcxUI2","85L3mbm1GiXSfYmQWZJSeayoG2s1","LrNnasvQp0e2p5JfpAI5Q642o512",
"UsE0jiSe6ZbLSQlO6k9W8ePWT043","ySAewUr5vLamX7LLdfzYD7jTWiJ2","ilzY7ckWVyQfjtULC8uiU2ciSW93",
"fvxbB9BLVNfxatmOaiseF7Jzz6B2","Klr0NkJuG3YpZ1KburbMBNpfO1q1"
]; 

// to get Matches
const cricapiMatchInfo_prekey = "https://cricapi.com/api/matches?apikey=";
const cricapiMatchInfo_postkey = "";
// to get match statistics
const cricapi_MatchDetails_prekey = "https://cricapi.com/api/fantasySummary?apikey=";
const cricapi_MatchDetails_postkey = "&unique_id=";


/* GET all users listing. */
router.use('/', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (forceGroupInfo) {
    var tmp = req.url.split("/")
    var tmpgroup = parseInt(tmp[1]);
    var myrec = null;
    if (!isNaN(tmpgroup))
      myrec = await IPLGroup.findOne({gid: tmpgroup});
    //console.log(tmp.length);
    if (!myrec) {
      senderr(722, `Invalid gourp number specified`);
      return; 
    }
    //console.log(myrec);
    _group = myrec.gid;
    _tournament = myrec.tournament;
    tmp.splice(1, 2);
    req.url = tmp.join("/");
    if (req.url.length === 0) req.url = '/';
  }
  else {
    _group = 1;
    _tournament = "IPL2020";
  }

  if (req.url == "/")
    publish_stats();
  else
    next('route');
});

router.use('/test1/:mid', async function(req, res, next) {
  PlayerStatRes = res;  
  setHeader();

  var {mid} = req.params;
  var i = parseInt(mid);
  var mydata = await CricapiMatch.find({mid: i});
  console.log(`Starts at ${mydata[0].matchStartTime}  Ends at ${mydata[0].matchEndTime}`);  
  sendok(mydata);
});

router.use('/xxxxxxswap/:gid1/:gid2', async function(req, res, next) {
  PlayerStatRes = res;  
  setHeader();
  var {gid1, gid2} = req.params;
  if (isNaN(gid1)) { senderr(400, "Invalid GID1"); return}
  if (isNaN(gid2)) { senderr(400, "Invalid GID2"); return}
  var igid1 = parseInt(gid1);
  var igid2 = parseInt(gid2);

  var tmp = await IPLGroup.findOne({gid: igid1});
  if (!tmp) { senderr(400, "Invalid GID1"); return}
  tmp = await IPLGroup.findOne({gid: igid2});
  if (!tmp) { senderr(400, "Invalid GID2"); return}

  // swap GROUP 
  var allRecs = await IPLGroup.find({gid: {$in: [igid1, igid2]} })
  //console.log(allRecs);
  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  // swap GROUP Members
  var allRecs = await GroupMember.find({gid: {$in: [igid1, igid2]} })
  //console.log(allRecs);
  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  // swap Auction
  var allRecs = await Auction.find({gid: {$in: [igid1, igid2]} })
  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  // swap Captain
  var allRecs = await Captain.find({gid: {$in: [igid1, igid2]} })

  allRecs.forEach( x => {
    if      (x.gid == igid1)  x.gid = igid2;
    else if (x.gid == igid2)  x.gid = igid1;
    x.save();   
  })
  sendok("OK");
});

router.use('/test', async function(req, res, next) {
  PlayerStatRes = res;  
  setHeader();

  await update_cricapi_data_r1(true);
  sendok("OK");
});

// provide scrore of users beloging to the group
// currently only group 1 supported

router.use('/junked/internal/score', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  // get list of users in group
  var igroup = _group;
  var myGroup = await IPLGroup.findOne({gid: igroup})
  var gmembers = await GroupMember.find({gid: igroup});
  var auctionList = await Auction.find({gid: igroup});
  var captainlist = await Captain.find({gid: igroup});

  // Set collection name 
  var tournamentStat = mongoose.model(myGroup.tournament, StatSchema);
  var statList = await tournamentStat.find({});
  
  var userScoreList = [];    
  // now calculate score for each user
  gmembers.forEach( u  => {
    var userPid = u.uid;
    //console.log(`User: ${userPid}`);
    //var myUserScore = [];

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //console.log(myplayerstats)

      // update score of each match played by user
      // myplayerstats.forEach(s => {
      //   s.score = calculateScore(s)*MF;
      // })
      //var myScore = _.sumBy(myplayerstats, x => x.score);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var tmp = { uid: userPid, pid: p.pid, playerScrore: myScore, stat: myplayerstats};
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  //console.log(userScoreList);
  sendok(userScoreList);
});


router.use('/maxrun/:myuser', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  var {myuser} = req.params;
  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  statMax(iuser, doMaxRun);
});

router.use('/maxwicket/:myuser', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  var {myuser} = req.params;
  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  statMax(iuser, doMaxWicket);
});


router.use('/brief/:myuser', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  var {myuser} = req.params;
  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  statBrief(iuser);

});


router.use('/score/:myuser', function(req, res, next) {
  PlayerStatRes = res;
  setHeader();
  var {myuser} = req.params;
  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  statScore(iuser);
});

router.use('/rank/:myuser', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();
  var {myuser} = req.params;
  var iuser;
  if (myuser.toUpperCase() === "ALL")
    iuser = 0;
  else {
    if (isNaN(myuser)) {
      senderr(721, `Invalid user id ${myuser}`);
      return;      
    }
    iuser = parseInt(myuser);
  }
  statRank(iuser);
});

router.use('/updatemax', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  // first check if tournament is over (END has been signalled)
  var myTournament = await Tournament.findOne({name: _tournament});
  if (!myTournament.over) {
    senderr(723, "Tournament not yet over. Cannot assign Bonus point for Tournament Max Run and Wicket");
    return;
  }

  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var tdata = await tournamentStat.find({});
  var tmp = _.filter(tdata, x => x.mid == MaxRunMid);
  if (tmp.length > 0) {
    senderr(724, "Bonus point for Maximum run already assigned");
    return;
  }
  var tmp = _.filter(tdata, x => x.mid == MaxWicketMid);
  if (tmp.length > 0) {
    senderr(724, "Bonus point for Maximum wicket already assigned");
    return;
  }
  pidList = _.map(tdata, 'pid');
  pidList = _.uniqBy(pidList);

  // calculate total runs and total wockets of each player (played in tournament matches)
  var sumList = [];
  pidList.forEach( mypid => {
    tmp = _.filter(tdata, x => x.pid === mypid);
    if (tmp.length > 0) {
      var iRun = _.sumBy(tmp, 'run');
      var iWicket = _.sumBy(tmp, 'wicket');
      sumList.push({pid: mypid, playerName: tmp[0].playerName, totalRun: iRun, totalWicket: iWicket});
    }
  });

  // now get list of players who have score max runs (note there can be more than 1)
  var tmp = _.maxBy(sumList, x => x.totalRun);
  //console.log(tmp);
  var maxList = _.filter(sumList, x => x.totalRun == tmp.totalRun);
  var bonusAmount  = BonusMaxRun / maxList.length;
  maxList.forEach( mmm => {
    var myrec = getBlankStatRecord(tournamentStat);
    myrec.mid = MaxRunMid;
    myrec.pid = mmm.pid;
    myrec.playerName = mmm.playerName;
    myrec.score = bonusAmount;
    myrec.maxTouramentRun = mmm.totalRun;  
    myrec.save(); 
  });

  // now get list of players who have taken max wickets (note there can be more than 1)
  var tmp = _.maxBy(sumList, x => x.totalWicket);
  //console.log(tmp);
  var maxList = _.filter(sumList, x => x.totalWicket == tmp.totalWicket);
  bonusAmount  = BonusMaxWicket / maxList.length;
  maxList.forEach( mmm => {
    var myrec = getBlankStatRecord(tournamentStat);
    myrec.mid = MaxWicketMid;
    myrec.pid = mmm.pid;
    myrec.playerName = mmm.playerName;
    myrec.score = bonusAmount;
    myrec.maxTouramentWicket = mmm.totalWicket;
    myrec.save(); 
  });
  
  sendok("OK");
  // allocate bonus points to player with maximum run and maximum wicket
});



// provide scrore of users beloging to the group
// currently only group 1 supported
/*
router.use('/internal/:infoType/:whichUser', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();
  var {infoType, whichUser} = req.params;
  console.log(`${infoType}  && ${whichUser}`)
  if (whichUser.toUpperCase() === "ALL") whichUser = '0';
  if (isNaN(whichUser)) {
    senderr(721, `Invalid user id ${whichUser}`);
    return;
  }
  var iwhichUser = parseInt(whichUser);
  // find out users belnging to Group 1 (this is default). and set in igroup
  var igroup = _group;
  var allusers = await User.find({});
  var myGroup = await IPLGroup.findOne({gid: igroup});
  var gmembers = await GroupMember.find({gid: igroup});
  var userlist = _.map(gmembers, 'uid');      
  var captainlist = await Captain.find({gid: igroup});
  // Set collection name 
  var tournamentStat = mongoose.model(myGroup.tournament, StatSchema);
  // var tourmanetStatus = await tournamentOver(igroup);
  // console.log(`Group 1 tournamemnet status: ${tourmanetStatus}`);
  
  // get all players auctioned by this group members and also fetch the stats of those players
  var auctionList = await Auction.find({gid: igroup,  uid: { $in: userlist }});
  var allplayer = _.map(auctionList, 'pid')
  var statList = await tournamentStat.find({pid: {$in: allplayer}});
  // now calculate score for each user
  var userRank = [];
  gmembers.forEach( gm => {
    userPid = gm.uid;
    var urec = _.filter(allusers, u => u.uid === userPid);
    var curruserName = (urec) ? urec[0].userName : "";
    var currdisplayName = (urec) ? urec[0].displayName : "";
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});
    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    var userScoreList = [];    
    myplayers.forEach( p => {
      var MF = 1;
      //console.log(capinfo);
      if (p.pid === capinfo.viceCaptain) {
        //console.log(`Vice Captain is ${capinfo.viceCaptain}`)
        MF = ViceCaptain_MultiplyingFactor;
      } else if (p.pid === capinfo.captain) {
        //console.log(`Captain is ${capinfo.captain}`)
        MF = Captain_MultiplyingFactor;
      } else {
        //console.log(`None of the above: ${p.pid}`);
      }
      //console.log(`Mul factor: ${MF}`);
      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      //console.log(`Player: ${p.pid}   Score: ${myScore}  MF used: ${MF}`);
      userScoreList.push({ uid: userPid, pid: p.pid, playerScore: myScore});
    });
    var totscore = _.sumBy(userScoreList, x => x.playerScore);
    //if (userPid === 9) totscore = 873;  // for testing
    // do not assign rank. Just now. Will be assigned when info of all user grad score is available
    userRank.push({ 
      uid: userPid, 
      userName: curruserName, 
      displayName: currdisplayName,
      grandScore: totscore, 
      rank: 0});
  })
  // assign ranking
  var lastRank = 0;
  var nextRank = 0;
  var lastScore = 99999999999999999999999999999;  // OMG such a big number!!!! Can any player score this many points
  userRank.forEach( x => {
    ++nextRank;
    if (x.grandScore < lastScore) {
      lastRank = nextRank;
      lastScore = x.grandScore;
    }
    x.rank = lastRank;
  });
  if (iwhichUser != 0)
  userRank = _.filter(userRank, x => x.uid == iwhichUser);
  //console.log(userRank);
  sendok(userRank);
});
*/

async function statBrief_orig(iwhichuser)
{
  // get list of users in group
  var igroup = _group;
  var allusers = await User.find({});
  var gmembers = await GroupMember.find({gid: igroup});
  var userlist = _.map(gmembers, 'uid');
  
  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);

  // get all players auctioned by this group 
  var auctionList = await Auction.find({gid: _group, uid: {$in: userlist}});
  var allplayerList = _.map(auctionList, 'pid');
  var statList = await tournamentStat.find({pid: {$in: allplayerList}});
  var captainlist = await Captain.find({gid: igroup});

  var userScoreList = [];    
  // now calculate score for each user
  userlist.forEach( userPid  => {
    var urec = _.filter(allusers, x => x.uid == userPid);
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
      var myplayerstats = _.map(myplayerstats, o => _.pick(o, ['mid', 'pid', 'score']));
      //console.log(myplayerstats);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var tmp = { 
        uid: userPid, 
        userName: urec[0].userName,
        displayName: urec[0].displayName,
        pid: p.pid, 
        playerName: p.playerName,
        playerScrore: myScore, 
        stat: myplayerstats
      };
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  if (iwhichuser != 0) {
    userScoreList = _.filter(userScoreList, x => x.uid == iwhichuser);
  }
  //console.log(userScoreList);
  sendok(userScoreList);
}

async function statBrief(iwhichuser)
{
  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var igroup = _group;
  // get list of users in group
  var PstatList = tournamentStat.find({});
  var PauctionList = Auction.find({gid: igroup});
  var Pallusers = User.find({});
  var Pgmembers = GroupMember.find({gid: igroup});
  var Pcaptainlist = Captain.find({gid: igroup});

  //var userlist = _.map(gmembers, 'uid');
  var captainlist = await Pcaptainlist;
  var gmembers = await Pgmembers;
  var allusers = await Pallusers;
  var statList = await PstatList;
  var auctionList = await PauctionList;

  // get all players auctioned by this group 
  //var allplayerList = _.map(auctionList, 'pid');

  var userScoreList = [];    
  // now calculate score for each user
  gmembers.forEach( gm  => {
    var userPid = gm.uid;
    var urec = _.find(allusers, x => x.uid == userPid);
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.uid === userPid); 
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
      var myplayerstats = _.map(myplayerstats, o => _.pick(o, ['mid', 'pid', 'score']));
      //console.log(myplayerstats);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var tmp = { 
        uid: userPid, 
        userName: urec.userName,
        displayName: urec.displayName,
        pid: p.pid, 
        playerName: p.playerName,
        playerScrore: myScore, 
        stat: myplayerstats
      };
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  if (iwhichuser != 0) {
    userScoreList = _.filter(userScoreList, x => x.uid == iwhichuser);
  }
  //console.log(userScoreList);
  sendok(userScoreList); 
}

async function statScore_orig(iwhichUser) {
  // get list of users in group
  var igroup = _group;
  var allusers = await User.find({});
  //var myGroup = await IPLGroup.findOne({gid: igroup})
  var gmembers = await GroupMember.find({gid: igroup});
  var auctionList = await Auction.find({gid: igroup});
  var captainlist = await Captain.find({gid: igroup});

  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var statList = await tournamentStat.find({});
  
  var userScoreList = [];    
  // now calculate score for each user
  gmembers.forEach( u  => {
    var userPid = u.uid;
    var urec = _.filter(allusers, u => u.uid === userPid);
    var curruserName = (urec) ? urec[0].userName : "";
    var currdisplayName = (urec) ? urec[0].displayName : "";

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //console.log(myplayerstats)

      // update score of each match played by user
      // myplayerstats.forEach(s => {
      //   s.score = calculateScore(s)*MF;
      // })
      //var myScore = _.sumBy(myplayerstats, x => x.score);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      //console.log(`Player name: ${p}`)
      var tmp = { 
        uid: userPid, 
        userName: curruserName,
        displayName: currdisplayName,
        pid: p.pid, 
        playerName: p.playerName, 
        playerScrore: myScore, 
        stat: myplayerstats};
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  if (iwhichUser != 0)
    userScoreList = _.filter(userScoreList, x => x.uid === iwhichUser);
  sendok(userScoreList);
}

async function statScore(iwhichUser) {
  // get list of users in group
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var igroup = _group;

  var PstatList =  tournamentStat.find({});
  var PauctionList =  Auction.find({gid: igroup});
  var Pallusers =  User.find({});
  var Pgmembers =  GroupMember.find({gid: igroup});
  var Pcaptainlist =  Captain.find({gid: igroup});

  // wait for data fetch to be over
  captainlist = await Pcaptainlist;
  gmembers = await Pgmembers;
  allusers = await Pallusers;
  auctionList = await PauctionList;
  statList = await PstatList;

  // now calculate score for each user
  var userScoreList = [];    
  gmembers.forEach( u  => {
    var userPid = u.uid;
    var urec = _.find(allusers, u => u.uid === userPid);
    var curruserName = urec.userName;
    var currdisplayName = urec.displayName;

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //console.log(myplayerstats)

      // update score of each match played by user
      // myplayerstats.forEach(s => {
      //   s.score = calculateScore(s)*MF;
      // })
      //var myScore = _.sumBy(myplayerstats, x => x.score);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      //console.log(`Player name: ${p}`)
      var tmp = { 
        uid: userPid, 
        userName: curruserName,
        displayName: currdisplayName,
        pid: p.pid, 
        playerName: p.playerName, 
        playerScrore: myScore, 
        stat: myplayerstats};
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  if (iwhichUser != 0)
    userScoreList = _.filter(userScoreList, x => x.uid === iwhichUser);
  sendok(userScoreList);
}


async function statRank_orig (iwhichUser) {
  // find out users belnging to Group 1 (this is default). and set in igroup
  var igroup = _group;
  var allusers = await User.find({});
  //var myGroup = await IPLGroup.findOne({gid: igroup});
  var gmembers = await GroupMember.find({gid: igroup});
  var userlist = _.map(gmembers, 'uid');      
  var captainlist = await Captain.find({gid: igroup});
  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);

  // var tourmanetStatus = await tournamentOver(iroup);
  // console.log(`Group 1 tournamemnet status: ${tourmanetStatus}`);
  
  // get all players auctioned by this group members and also fetch the stats of those players
  var auctionList = await Auction.find({gid: igroup,  uid: { $in: userlist }});
  var allplayer = _.map(auctionList, 'pid')
  var statList = await tournamentStat.find({pid: {$in: allplayer}});

  // now calculate score for each user
  var userRank = [];
  gmembers.forEach( gm => {
    userPid = gm.uid;
    var urec = _.filter(allusers, u => u.uid === userPid);
    var curruserName = (urec) ? urec[0].userName : "";
    var currdisplayName = (urec) ? urec[0].displayName : "";
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    var userScoreList = [];    
    myplayers.forEach( p => {
      var MF = 1;
      //console.log(capinfo);
      if (p.pid === capinfo.viceCaptain) {
        //console.log(`Vice Captain is ${capinfo.viceCaptain}`)
        MF = ViceCaptain_MultiplyingFactor;
      } else if (p.pid === capinfo.captain) {
        //console.log(`Captain is ${capinfo.captain}`)
        MF = Captain_MultiplyingFactor;
      } else {
        //console.log(`None of the above: ${p.pid}`);
      }
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      //console.log(`Player: ${p.pid}   Score: ${myScore}  MF used: ${MF}`);
      userScoreList.push({ uid: userPid, pid: p.pid, playerScore: myScore});
    });
    var totscore = _.sumBy(userScoreList, x => x.playerScore);
    //if (userPid === 9) totscore = 873;  // for testing
    // do not assign rank. Just now. Will be assigned when info of all user grad score is available
    userRank.push({ 
      uid: userPid, 
      userName: curruserName, 
      displayName: currdisplayName,
      grandScore: totscore, 
      rank: 0});
  })
  // assign ranking
  var lastRank = 0;
  var nextRank = 0;
  var lastScore = 99999999999999999999999999999;  // OMG such a big number!!!! Can any player score this many points
  userRank = _.sortBy(userRank, 'grandScore').reverse();

  userRank.forEach( x => {
    ++nextRank;
    if (x.grandScore < lastScore) {
      lastRank = nextRank;
      lastScore = x.grandScore;
    }
    x.rank = lastRank;
  });
  
  if (iwhichUser != 0)
  userRank = _.filter(userRank, x => x.uid == iwhichUser);
  //console.log(userRank);
  sendok(userRank);
}


async function statRank (iwhichUser) {
  // find out users belnging to Group 1 (this is default). and set in igroup
  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var igroup = _group;
  // make async mongose calls
  const PstatList = tournamentStat.find({});
  const PauctionList = Auction.find({gid: igroup });
  const Pallusers = User.find({});
  const Pgmembers = GroupMember.find({gid: igroup});
  const Pcaptainlist = Captain.find({gid: igroup});

  //const [someResult, anotherResult] = await Promise.all([someCall(), anotherCall()]);
  //const finalResult = [await someResult, await anotherResult];
  // const  finalResult = [await allusers, await gmembers, await captainlist,
  //                       await auctionList, await statList];
  
  captainlist = await Pcaptainlist;
  gmembers = await Pgmembers;
  allusers = await Pallusers
  auctionList = await PauctionList
  statList = await PstatList;

  //console.log(Pcaptainlist);
  //console.log(captainlist);
  //console.log(igroup);
  //var userlist = _.map(gmembers, 'uid');      

  // var tourmanetStatus = await tournamentOver(iroup);
  // console.log(`Group 1 tournamemnet status: ${tourmanetStatus}`);
  
  // get all players auctioned by this group members and also fetch the stats of those players
  // var allplayer = _.map(auctionList, 'pid')
  // var statList = await tournamentStat.find({pid: {$in: allplayer}});

  // now calculate score for each user
  var userRank = [];
  gmembers.forEach( gm => {
    userPid = gm.uid; 
    var urec = _.filter(allusers, u => u.uid === userPid);
    var curruserName = (urec) ? urec[0].userName : "";
    var currdisplayName = (urec) ? urec[0].displayName : "";
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});
    //console.log(capinfo);
    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    var userScoreList = [];    
    myplayers.forEach( p => {
      var MF = 1;
      //console.log(capinfo);
      if (p.pid === capinfo.viceCaptain) {
        //console.log(`Vice Captain is ${capinfo.viceCaptain}`)
        MF = ViceCaptain_MultiplyingFactor;
      } else if (p.pid === capinfo.captain) {
        //console.log(`Captain is ${capinfo.captain}`)
        MF = Captain_MultiplyingFactor;
      } else {
        //console.log(`None of the above: ${p.pid}`);
      }
      //console.log(`Mul factor: ${MF}`);

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      //console.log(`Player: ${p.pid}   Score: ${myScore}  MF used: ${MF}`);
      userScoreList.push({ uid: userPid, pid: p.pid, playerScore: myScore});
    });
    var totscore = _.sumBy(userScoreList, x => x.playerScore);
    //if (userPid === 9) totscore = 873;  // for testing
    // do not assign rank. Just now. Will be assigned when info of all user grad score is available
    userRank.push({ 
      uid: userPid, 
      userName: curruserName, 
      displayName: currdisplayName,
      grandScore: totscore, 
      rank: 0});
  })
  // assign ranking
  var lastRank = 0;
  var nextRank = 0;
  var lastScore = 99999999999999999999999999999;  // OMG such a big number!!!! Can any player score this many points
  userRank = _.sortBy(userRank, 'grandScore').reverse();

  userRank.forEach( x => {
    ++nextRank;
    if (x.grandScore < lastScore) {
      lastRank = nextRank;
      lastScore = x.grandScore;
    }
    x.rank = lastRank;
  });
  
  if (iwhichUser != 0)
  userRank = _.filter(userRank, x => x.uid == iwhichUser);
  //console.log(userRank);
  sendok(userRank);
}

async function statMax_orig(iwhichuser, doWhat)
{
  var tournamentStat = mongoose.model(_tournament, StatSchema);

  // get list of users in group
  var gmembers = await GroupMember.find({gid: _group}); 
  
  // get all players auctioned by this group 
  var allusers = await User.find({});
  var auctionList = await Auction.find({gid: _group});
  var allplayerList = _.map(auctionList, 'pid');
  var statList = await tournamentStat.find({pid: {$in: allplayerList}});
  var captainlist = await Captain.find({gid: _group});

  var userScoreList = [];    
  // now calculate score for each user
  gmembers.forEach( gm  => {
    userPid = gm.uid;

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});
  
    var urec = _.filter(allusers, x => x.uid == userPid);
    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.uid == userPid); 
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
      //var myplayerstats = _.map(myplayerstats, o => _.pick(o, ['mid', 'pid', 'score']));
      //console.log(myplayerstats);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var totRun = _.sumBy(myplayerstats, x => x.run);
      // console.log(myplayerstats);
      // console.log(totRun);
      var totWicket = _.sumBy(myplayerstats, x => x.wicket);
      var tmp = { 
        uid: userPid, 
        userName: urec[0].userName,
        displayName: urec[0].displayName,
        pid: p.pid, 
        playerName: p.playerName,
        playerScrore: myScore, 
        totalRun: totRun,
        totalWicket: totWicket
      };
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })

  if (iwhichuser != 0)
    userScoreList = _.filter(userScoreList, x => x.uid == iwhichuser);

  var maxarray = [];
  gmembers.forEach( gm => {
    var tmp = _.filter(userScoreList, x => x.uid == gm.uid);
    if (tmp.length == 0) return;

    var tmpRun = _.maxBy(tmp, x => x.totalRun);
    var tmpWicket = _.maxBy(tmp, x => x.totalWicket);
    //console.log(tmpRun);
    if ((doWhat === doMaxRun) && (tmpRun.totalRun > 0)) {
      console.log("In total run");
      var maxRun = _.filter(tmp, x => x.totalRun == tmpRun.totalRun );
      maxRun.forEach( runrec => {
        maxarray.push({ 
          uid: gm.pid, 
          userName: runrec.userName,
          displayName: runrec.displayName,
          maxRunPlayerId: runrec.pid,
          maxRunPlayerName: runrec.playerName,
          maxRun: runrec.totalRun,
        });
      });
    } else if ((doWhat === doMaxWicket) && (tmpWicket.totalWicket > 0)) {
      console.log(`in else  ${tmpWicket.totalWicket}`);
      var maxWicket = _.filter(tmp, x => x.totalWicket === tmpWicket.totalWicket );
      maxWicket.forEach( wktrec => {
        maxarray.push({ 
          uid: gm.pid, 
          userName: wktrec.userName,
          displayName: wktrec.displayName,
          maxWicketPlayerId: wktrec.pid,
          maxWicketPlayerName: wktrec.playerName,
          maxWicket: wktrec.totalWicket
        });
      });
    }
  });
  //console.log(maxarray);
  sendok(maxarray);
}

async function statMax(iwhichuser, doWhat)
{
  var tournamentStat = mongoose.model(_tournament, StatSchema);

  // get list of users in group
  var PstatList = tournamentStat.find({});
  var PauctionList = Auction.find({gid: _group});
  var Pallusers = User.find({});
  var Pgmembers = GroupMember.find({gid: _group}); 
  var Pcaptainlist = Captain.find({gid: _group});
  
  var captainlist = await Pcaptainlist;
  var gmembers = await Pgmembers;
  var allusers= await Pallusers;
  var auctionList = await PauctionList;
  var statList = await PstatList;

  // get all players auctioned by this group 
  //var allplayerList = _.map(auctionList, 'pid');
  // now calculate score for each user
  var userScoreList = [];    
  gmembers.forEach( gm  => {
    userPid = gm.uid;

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: _group, uid: userPid, captain: 0, viceCaptain: 0});
  
    var urec = _.find(allusers, x => x.uid == userPid);
    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.uid == userPid); 
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.viceCaptain)
        MF = ViceCaptain_MultiplyingFactor;
      else if (p.pid === capinfo.captain)
        MF = Captain_MultiplyingFactor;

      // now get the statistics of this player in various maches
      var myplayerstats = _.filter(statList, x => x.pid === p.pid);
      //ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
      //var myplayerstats = _.map(myplayerstats, o => _.pick(o, ['mid', 'pid', 'score']));
      //console.log(myplayerstats);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var totRun = _.sumBy(myplayerstats, x => x.run);
      // console.log(myplayerstats);
      // console.log(totRun);
      var totWicket = _.sumBy(myplayerstats, x => x.wicket);
      var tmp = { 
        uid: userPid, 
        userName: urec.userName,
        displayName: urec.displayName,
        pid: p.pid, 
        playerName: p.playerName,
        playerScrore: myScore, 
        totalRun: totRun,
        totalWicket: totWicket
      };
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })

  if (iwhichuser != 0)
    userScoreList = _.filter(userScoreList, x => x.uid == iwhichuser);

  var maxarray = [];
  gmembers.forEach( gm => {
    var tmp = _.filter(userScoreList, x => x.uid == gm.uid);
    if (tmp.length == 0) return;

    var tmpRun = _.maxBy(tmp, x => x.totalRun);
    var tmpWicket = _.maxBy(tmp, x => x.totalWicket);
    //console.log(tmpRun);
    if ((doWhat === doMaxRun) && (tmpRun.totalRun > 0)) {
      console.log("In total run");
      var maxRun = _.filter(tmp, x => x.totalRun == tmpRun.totalRun );
      maxRun.forEach( runrec => {
        maxarray.push({ 
          uid: gm.uid, 
          userName: runrec.userName,
          displayName: runrec.displayName,
          maxRunPlayerId: runrec.pid,
          maxRunPlayerName: runrec.playerName,
          maxRun: runrec.totalRun,
        });
      });
    } else if ((doWhat === doMaxWicket) && (tmpWicket.totalWicket > 0)) {
      //console.log(`in else  ${tmpWicket.totalWicket}`);
      var maxWicket = _.filter(tmp, x => x.totalWicket === tmpWicket.totalWicket );
      maxWicket.forEach( wktrec => {
        maxarray.push({ 
          uid: gm.uid, 
          userName: wktrec.userName,
          displayName: wktrec.displayName,
          maxWicketPlayerId: wktrec.pid,
          maxWicketPlayerName: wktrec.playerName,
          maxWicket: wktrec.totalWicket
        });
      });
    }
  });
  //console.log(maxarray);
  sendok(maxarray);
}

async function update_cricapi_data_r1(logToResponse)
{
    let myindex;

    // 1st if time is up then get match details from cricapi
    if (timeToFetchMatches()) {
      console.log("time to fetch match details");
      var existingmatches = await CricapiMatch.find({});
        
      // now fetch fresh match details from cricapi
      var matchesFromCricapi = await fetchMatchesFromCricapi();
      if (matchesFromCricapi.matches == undefined) {
        console.log(matchesFromCricapi);
        var errmsg = "Could not fetch Match details from CricAPI"
        if (logToResponse)  senderr(CRICFETCHERR, errmsg)
        else                console.log(errmsg);
        return; 
      }

      // get all tournamnet and their teams
      allTournament = await Tournament.find({over: false});
      var tournamentList = _.map(allTournament, 'name'); 
      var allTeams = await Team.find({tournament: {$in: tournamentList} });

      // process each match found in cricapy
      matchesFromCricapi.matches.forEach(x => {
        var myTeam1 = x['team-1'].toUpperCase();
        var myTeam2 = x['team-2'].toUpperCase();
        //console.log(`${myTeam1} ${myTeam2}`);
        if ((myTeam1 === "TBA") || (myTeam2 === "TBA")) return;

        var matchTournament = '';
        var mytype = x.type.toUpperCase();
        allTournament.forEach(t => {
          var typeHasMatched = false;
          switch (t.type) {
            case "TEST":
              if (mytype.includes("TEST"))
                typeHasMatched = true;
              break;
            case "ODI":
              if (mytype.includes("ODI"))
                typeHasMatched = true;
              break;
            case "T20":
              if (mytype.includes("20") || mytype.includes("TWENTY"))
                typeHasMatched = true;
              break;
          }
          if (!typeHasMatched) return;

          //console.log(`Two teams are ${myTeam1} and ${myTeam2}`);
          var myteams = _.filter(allTeams, tm => tm.tournament == t.name);
          //console.log(myteams);
          // find team 1  is part of this tournament
          var myindex = _.findIndex(myteams, (x) => { return x.name.toUpperCase() === myTeam1});
          //console.log(`My Index for team 1 is ${myindex}`)
          if (myindex < 0) return;

          // find team 2  is part of this tournament
          myindex = _.findIndex(myteams, (x) => { return x.name.toUpperCase() === myTeam2});
          //console.log(`My Index for team 2 is ${myindex}`)
          if (myindex < 0) return;

          // both the teams belong to this tournament. 
          //console.log(`Team: ${myTeam1} and ${myTeam2} are part of tournament ${t.name}`);
          matchTournament = t.name;
        });
        if (matchTournament.length === 0) return;
        console.log(`Tournament: ${matchTournament} Match Team1: ${myTeam1}  Team2: ${myTeam2}`)

        var mymatch = _.find(existingmatches, m => m.mid == parseInt(x.unique_id));
        if (mymatch === undefined) mymatch = new CricapiMatch();
        console.log(`dating match of ${x.unique_id}`)
        mymatch = getMatchDetails(x, mymatch, matchTournament);
        //console.log(mymatch);
        mymatch.save();
      });
      // end of check if this match part of our tournament

      // set next fetch time
      updateMatchFetchTime(matchesFromCricapi.provider); 
    }
    else 
      console.log("Match details not to be fetched now");

    // match update job done. Now get all matches which have started before current time
    var currtime = new Date(); 
    console.log(`Curr time ${currtime}`);
    let myfilter = { matchStartTime: {$lt: currtime }, matchEnded: false};
    //let myfilter = { matchEnded: false};
    var matchesFromDB = await CricapiMatch.find(myfilter);
    // console.log("My Matches");
    // console.log(matchesFromDB);
    // console.log(`Matches started count ${matchesFromDB.length}`)

    // get stas of all these matches
    await matchesFromDB.forEach(async (mmm) => {
      const cricData = await fetchMatchStatsFromCricapi(mmm.mid);
      var newstats = updateMatchStats_r1(mmm, cricData.data);
      // if pasrt end time. Then set matchended as true
      var currdate = new Date();
      console.log(`Match Id: ${mmm.mid}  Start: ${mmm.matchStartTime}  End: ${mmm.matchEndTime}`);
      if (mmm.matchEndTime < new Date()) {
        mmm.matchEnded = true;
        mmm.save();
      }     
    });
    return;
}


async function updateMatchStats_r1(mmm, cricdata)
{
  var currMatch = mmm.mid;
  console.log(`Match: ${currMatch} data update. Tournamen; ${mmm.tournament}`)  
  // from tournament name identify the name
  var tournamentStat = mongoose.model(mmm.tournament, StatSchema);

  
  var bowlingArray;
  if (!(cricdata.bowling === undefined))
    bowlingArray = cricdata.bowling;
  else
    bowlingArray = [];

  var battingArray;
  if (!(cricdata.batting === undefined))
    battingArray = cricdata.batting;
  else
    battingArray = [];

  var manOfTheMatchPid = 0;  
  if (cricdata["man-of-the-match"] != undefined) 
  if (cricdata["man-of-the-match"].pid != undefined)
  if (cricdata["man-of-the-match"].pid.length > 0)
    manOfTheMatchPid = parseInt(cricdata["man-of-the-match"].pid);

  //console.log(`Man of the match is ${manOfTheMatchPid} as per cric api ${cricdata["man-of-the-match"]}`)
  var allplayerstats = await tournamentStat.find({mid: mmm.mid});
  // update bowling details
  //console.log("Bowlong Started");
  // console.log(bowlingArray);
  bowlingArray.forEach( x => {
    x.scores.forEach(bowler => {
      // ***********************  IMP IMP IMP ***********************
      // some garbage records are sent by cricapi. Have found that in all these case Overs ("O") 
      // was set as "Allrounder", "bowler" "batsman".
      // ideally it should have #overs bowled i.e. numeric
      if (isNaN(bowler.O)) {
        //console.log(`Invalid Over ${bowler.O}. Skipping this recird`);
        return;
      }

      myindex = _.findIndex(allplayerstats, {mid: currMatch, pid: parseInt(bowler.pid)});
      if (myindex < 0) {
        var tmp = getBlankStatRecord(tournamentStat);
        tmp.mid = currMatch;
        tmp.pid = bowler.pid;
        tmp.playerName = bowler.bowler;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      allplayerstats[myindex].wicket = (bowler.W === undefined) ? 0 : bowler.W;
      allplayerstats[myindex].wicket5 = (bowler.W >= 5) ? 1 : 0;
      allplayerstats[myindex].wicket3 = ((bowler.W >= 3) && (bowler.W < 5)) ? 1 : 0;
      allplayerstats[myindex].hattrick = 0;
      allplayerstats[myindex].maiden = (bowler.M === undefined) ? 0 : bowler.M
      allplayerstats[myindex].maxTouramentRun = 0;
      allplayerstats[myindex].maxTouramentWicket = 0;
      console.log(`Wicket by ${allplayerstats[myindex].pid} : ${allplayerstats[myindex].wicket}`)
      if (!(bowler.O === undefined)) {
        var i = parseInt(bowler.O);
        if (isNaN(i))
          allplayerstats[myindex].oversBowled = 0;
        else
          allplayerstats[myindex].oversBowled = bowler.O;
      }
      if (allplayerstats[myindex].pid === manOfTheMatchPid)
        allplayerstats[myindex].manOfTheMatch = true;
      
      var myscore = calculateScore(allplayerstats[myindex]);
      allplayerstats[myindex].score = myscore;
    });
  });

  // update batting details
  // console.log("Batting started");
  // console.log(battingArray);
  battingArray.forEach( x => {
    x.scores.forEach(batsman => {
      myindex = _.findIndex(allplayerstats, {mid: currMatch, pid: parseInt(batsman.pid)});
      if (myindex < 0) {
        var tmp = getBlankStatRecord(tournamentStat);
        tmp.mid = currMatch;
        tmp.pid = batsman.pid;
        tmp.playerName = batsman.batsman;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      allplayerstats[myindex].run = (batsman.R === undefined) ? 0 : batsman.R;
      allplayerstats[myindex].fifty = ((batsman.R >= 50) && (batsman.R < 100)) ? 1 : 0;
      allplayerstats[myindex].hundred = (batsman.R >= 100) ? 1 : 0;
      allplayerstats[myindex].four = (batsman["4s"] === undefined) ? 0 : batsman["4s"];
      allplayerstats[myindex].six = (batsman["6s"] === undefined) ? 0 : batsman["6s"];
      allplayerstats[myindex].maxTouramentRun = 0;
      allplayerstats[myindex].maxTouramentWicket = 0;

      console.log(`Runs by ${allplayerstats[myindex].pid} : ${allplayerstats[myindex].run}`)

      if (!(batsman.B === undefined)) {
        var i = parseInt(batsman.B);
        if (isNaN(i))
          allplayerstats[myindex].ballsPlayed = 0;
        else
        allplayerstats[myindex].ballsPlayed = i;
      }
      if (allplayerstats[myindex].pid === manOfTheMatchPid) {
        allplayerstats[myindex].manOfTheMatch = true;
        console.log(`Man of the match is ${allplayerstats[myindex].pid}`);
      }

      var myscore = calculateScore(allplayerstats[myindex]);
      allplayerstats[myindex].score = myscore;
      //console.log(`Score; ${myscore} `);
    });
  });

  // update statistics in mongoose
  //console.log(allplayerstats.length);
  //console.log("Saveing statsu");
  allplayerstats.forEach(ps => {
    ps.save();
  })

  return;
}


function getMatchDetails(cricapiRec, mymatch, tournamentName) {
  var stime = getMatchStartTime(cricapiRec);
  var etime = getMatchEndTime(cricapiRec);
  var myweekday = weekDays[stime.getDay()];
  
  //var tmp = new CricapiMatch({
    mymatch.mid = cricapiRec.unique_id;
    mymatch.tournament = tournamentName;
    mymatch.team1 = cricapiRec['team-1'].toUpperCase();
    mymatch.team2 = cricapiRec['team-2'].toUpperCase();
    // mymatch.team1Description = cricapiRec['team-1'];
    // mymatch.team2Description = cricapiRec['team-2'];
    mymatch.matchStartTime = stime;
    mymatch.weekDay = myweekday;
    mymatch.type = cricapiRec.type;
    //toss_winner_team: "",   //x.toss_winner_team, 
    mymatch.squad = cricapiRec.squad;
    mymatch.matchStarted = cricapiRec.matchStarted;
    mymatch.matchEndTime = etime;
    var currtime = new Date();
    if (etime < currtime)
      mymatch.matchEnded = true;
    else
      mymatch.matchEnded = false;
    //if (mymatch.mid === 1198246) mymatch.matchEnded = false;
    //console.log(`Match-ID: ${mymatch.mid}  Started: ${mymatch.matchStarted}  Ended: ${mymatch.matchEnded}`)
    return mymatch;
}


function getBlankStatRecord(tournamentStat) {
  return new tournamentStat( {
    mid: 0,
    pid: 0,
    score: 0,
    inning: 0,
    playerName: "",
  // batting details
    run: 0,
    four: 0,
    six: 0,
    fifty: 0,
    hundred:  0,
    ballsPlayed: 0,
    // bowling details
    wicket: 0,
    wicket3: 0,
    wicket5: 0,
    hattrick: 0,
    maiden: 0,
    oversBowled: 0,
    maxTouramentRun: 0,
    maxTouramentWicket: 0,
    // overall performance
    manOfTheMatch: false
  });
}

function calculateScore(mystatrec) {
  //console.log(mystatrec);
  var mysum = 0;
  mysum += 
    (mystatrec.run * BonusRun) +
    (mystatrec.four * Bonus4) +
    (mystatrec.six * Bonus6) +
    (mystatrec.fifty * Bonus50) +
    (mystatrec.hundred * Bonus100) +
    (mystatrec.wicket * BonusWkt) +
    (mystatrec.wicket3 * BonusWkt3) +
    (mystatrec.wicket5 * BonusWkt5) +
    (mystatrec.maiden * BonusMaiden) +
    //((mystatrec.wicket == 0) ? BonusDuck : 0) +
    ((mystatrec.manOfTheMatch) ? BonusMOM : 0) + 
    ((mystatrec.maxTouramentRun > 0) ? BonusMaxRun : 0) +
    ((mystatrec.maxTouramentWicket > 0) ?  BonusMaxWicket : 0);

    // if ((mystatrec.ballsPlayed > 0) && (mystatrec.run == 0))
    //   mysum += BonusDuck;

    // if ((mystatrec.oversBowled > 0) && mystatrec.wicket == 0)
    //   mysum += BonusNoWkt;

  //console.log(`sum is ${mysum}`);
  return  mysum
}


// get details of match (batting and bowling)
async function fetchMatchStatsFromCricapi(matchId) { // (1)
  let cricres = await fetch(get_cricapi_MatchDetails_URL(matchId)); 

  if (cricres.status == 200) {
    let json = await cricres.json(); // (3)
    return json;
  }

  throw new Error(cricres.status);
}

// get match details from cricapi
async function fetchMatchesFromCricapi() {
  let matchres = await fetch(  get_cricapiMatchInfo_URL() );
  
  if (matchres.status == 200) { 
    let json = await matchres.json(); // (3)
    return json;
  }
  throw new Error(matchres.status); 
}

// schedule task
cron.schedule('*/2 * * * *', () => {
  console.log('==========running every N minute');
  if (db_connection)
    update_cricapi_data_r1(false);
  else
    console.log("============= No mongoose connection");
});

var keyIndex = 0;
function nextapikey() {
  if (++keyIndex >= keylist.length) 
    keyIndex = 0;
  return keylist[keyIndex];
}

// function to generate URL for data fetch from cric api
function get_cricapiMatchInfo_URL()
{ 
  return cricapiMatchInfo_prekey + nextapikey() + cricapiMatchInfo_postkey
}

function get_cricapi_MatchDetails_URL(matchid)
{
  return cricapi_MatchDetails_prekey + nextapikey() + cricapi_MatchDetails_postkey + matchid;
}

// time based functions:

function timeToFetchMatches() {
  var currtime = new Date();
  //console.log(`Next FetchTime: ${nextMatchFetchTime}`);
  if (currtime >= nextMatchFetchTime)
    return true;
  else
    return false;
}

// not used now. obsolete
function tomorrowFetchTime() {
  const tomorrowAtHours = 7;
  var newdt = new Date();
  newdt.setDate(newdt.getDate() + 1);
  newdt.setHours(tomorrowAtHours);
  newdt.setMinutes(0);
  newdt.setSeconds(0);
  return newdt;
}


function updateMatchFetchTime(provider) {
  var newdt;
  /**
  //console.log(`Published date is ${provider.pubDate}`);
  if (isItToday(provider.pubDate)) {
    // if match data received today then set it for tomorrow at 7
    newdt = tomorrowFetchTime();
  } else {
    // advance match fetch time by 3 hours
    // if end of day then set it to tomorrow at 7
    var newhr = nextMatchFetchTime.getHours() + 3;
    if (newhr > 23) {
      newdt = tomorrowFetchTime();
    } else {
      newdt = new Date();     //(nextMatchFetchTime.getTime());
      newdt.setHours(newhr);
      newdt.setMinutes(0);
      newdt.setSeconds(0);
    }
  }
  */
  //nextMatchFetchTime = newdt;

  nextMatchFetchTime.setHours(nextMatchFetchTime.getHours() + MATCHREADINTERVAL);
  console.log(`New match fetch fime is ${nextMatchFetchTime}`);
}


// if the date is today. Ignore 
function isItToday(mytimestr) {
  //console.log(`String: ${mytimestr}`);

  var currtime = new Date();
  var mytime = new Date(mytimestr);
  console.log(`=============> Time String: ${mytimestr}  Date: ${mytime}`);
  var sts = (
    (currtime.getFullYear() === mytime.getFullYear()) && 
    (currtime.getMonth() === mytime.getMonth()) && 
    (currtime.getDate() === mytime.getDate()))
  //console.log(`${mytime} is today: ${sts}`);
  return sts;
}

function getMatchStartTime(cricapiRec) {
  var mytime = new Date(cricapiRec.dateTimeGMT);        // clone start date
  //mytime.setMinutes(mytime.getMinutes() + minutesIST);
  return mytime;
}

const OdiHours = 9;
const testHours = 9;
const t20Hours = 4;

function getMatchEndTime(cricapiRec) {
  var tmp = getMatchStartTime(cricapiRec);       // clone start date
  var etime = new Date(tmp.getTime());
  var matchHours;

  var typeUpper = cricapiRec.type.toUpperCase();
  // if test match advance date by 4 days (to make it 5th day)
  if (typeUpper.includes("TEST")) {
    etime.setDate(etime.getDate()+4);     // test match is for 5 days. set date to 5th day
    matchHours = testHours;
  } else if (typeUpper.includes("ODI")) {
    matchHours = OdiHours;
  } else if (typeUpper.includes("20")) {
    matchHours = t20Hours;
  } else
    matchHours = OdiHours;

  // addd match time to end date
  etime.setHours(etime.getHours() + matchHours);

  return etime;
}

async function publish_stats()
{
  // Set collection name 
  var tournamentStat = mongoose.model(_tournament, StatSchema);
  var statList = await tournamentStat.find({});
  sendok(statList);
  // //console.log(filter_stats);
  // Stat.find(filter_stats,(err,slist) =>{
  //   if(slist) sendok(slist);
  //   else      senderr(DBFETCHERR, "Unable to fetch statistics from database");
  // });
}

async function tournamentOver(groupno) {
  var myrec = await IPLGroup.findOne({gid: groupno});
  var tournamentName = myrec.tournament;
  var tRec = await Tournament.findOne({name: tournamentName});
  if (myrec)
    return (myrec.enabled == false);
  return;
}

async function get_userDisplayName(userId) {
  var myuser = "";
  var myrec = await User.findOne({uid: userId});
  if (myrec) 
    myuser = myrec.displayName;
  return myuser;
}

function sendok(usrmsg) { PlayerStatRes.send(usrmsg); }
function senderr(errcode, errmsg) { PlayerStatRes.status(errcode).send(errmsg); }
function setHeader() {
  PlayerStatRes.header("Access-Control-Allow-Origin", "*");
  PlayerStatRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;

// for testing async function
// async function testingAwait()
// {
//   console.log("Starting Timer");
//   let promise = new Promise( (resolve, reject) => {
//     setTimeout(() => resolve('Done'), 10000);
//   });
//   let result = await promise;
//   console.log(result);
// }