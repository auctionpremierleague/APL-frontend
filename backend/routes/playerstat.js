router = express.Router();
var PlayerStatRes;

/*
const keylist = ["bbdCNNOKBtPnL54mvGSgpToFUlA2",
                // padmavti mata from here
                "O9vYC5AxilYm7V0EkYkvRP5jF9B2","RTf9weNrX8Xn2ts1ksdzAXcuxnE3",
                "H2ObZFee6BVMN5kCjLxYCMwcEp52","kAWvFxmpeJZmbtyNeDLXtxUPrAH3",
                "EstH4EqbfEXMKXcS9M83k7cqUs13","ApVnpFFO6kgxTYXVwWQTEeiFVCO2",
                "72QuFkQezxf5IdqxV1CtGJrAtcn1"
                ];
*/
const keylist = [				
"O9vYC5AxilYm7V0EkYkvRP5jF9B2","RTf9weNrX8Xn2ts1ksdzAXcuxnE3","H2ObZFee6BVMN5kCjLxYCMwcEp52",
"kAWvFxmpeJZmbtyNeDLXtxUPrAH3","EstH4EqbfEXMKXcS9M83k7cqUs13","ApVnpFFO6kgxTYXVwWQTEeiFVCO2",
"72QuFkQezxf5IdqxV1CtGJrAtcn1","mggoPlJzYFdVbnF9FYio5GTLVD13","AdHGF0Yf9GTVJcofkoRTt2YHK3k1",
"4mtu16sveyTPWgz5ID7ru9liwE12","iEsdTQufBnToUI1xVxWMQF6wauX2","bbdCNNOKBtPnL54mvGSgpToFUlA2",
"AM690XluFdZJ85PYvOP7IxgcxUI2","85L3mbm1GiXSfYmQWZJSeayoG2s1","LrNnasvQp0e2p5JfpAI5Q642o512",
"UsE0jiSe6ZbLSQlO6k9W8ePWT043","ySAewUr5vLamX7LLdfzYD7jTWiJ2","ilzY7ckWVyQfjtULC8uiU2ciSW93",
"fvxbB9BLVNfxatmOaiseF7Jzz6B2","Klr0NkJuG3YpZ1KburbMBNpfO1q1"
];

/** const keylist = [ "LrNnasvQp0e2p5JfpAI5Q642o512"]; **/

// to get Matches
const cricapiMatchInfo_prekey = "https://cricapi.com/api/matches?apikey=";
const cricapiMatchInfo_postkey = "";
// to get match statistics
const cricapi_MatchDetails_prekey = "https://cricapi.com/api/fantasySummary?apikey=";
const cricapi_MatchDetails_postkey = "&unique_id=";


/* GET all users listing. */
router.use('/', function(req, res, next) {
  PlayerStatRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == "/")
    publish_stats(defaultGroup);
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

router.use('/test2', async function(req, res, next) {
  PlayerStatRes = res;  
  setHeader();

  var allplayers = await Player.find({});
  allplayers.forEach(x => {
    switch (x.Team) {
      case "NEWTEAM": 
      case "PAK":
        x.tournament = "ENGPAKT20";
        break;
      default:
        x.tournament = "IPL2020";
        break;
    }
    x.save();
  })
  sendok("OK");
});

router.use('/test', async function(req, res, next) {
  PlayerStatRes = res;  
  setHeader();

  update_cricapi_data_r1(true);
  sendok("OK");
});

// provide scrore of users beloging to the group
// currently only group 1 supported
router.use('/score', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  // get list of users in group
  var igroup = defaultGroup;
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
      capinfo = new Captain ({ gid: defaultGroup, uid: userPid, captain: 0, viceCaptain: 0});

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


router.use('/brief', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  // get list of users in group
  var igroup = defaultGroup;
  var myGroup = await IPLGroup.findOne({gid: igroup});
  var gmembers = await GroupMember.find({gid: igroup});
  var userlist = _.map(gmembers, 'uid');

  // Set collection name 
  var tournamentStat = mongoose.model(myGroup.tournament, StatSchema);

  // get all players auctioned by this group 
  var auctionList = await Auction.find({gid: igroup, uid: {$in: userlist}});
  var allplayerList = _.map(auctionList, 'pid');
  var statList = await tournamentStat.find({pid: {$in: allplayerList}});
  var captainlist = await Captain.find({gid: igroup});

  var userScoreList = [];    
  // now calculate score for each user
  userlist.forEach( userPid  => {
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: defaultGroup, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
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
      console.log(myplayerstats);
      var myScore = _.sumBy(myplayerstats, x => x.score)*MF;
      var tmp = { uid: userPid, pid: p.pid, playerScrore: myScore, stat: myplayerstats};
      //console.log(tmp);
      userScoreList.push(tmp);
    });
  })
  //console.log(userScoreList);
  sendok(userScoreList);
});


// provide scrore of users beloging to the group
// currently only group 1 supported
router.use('/rank', async function(req, res, next) {
  PlayerStatRes = res;
  setHeader();

  // find out users belnging to Group 1 (this is default). and set in igroup
  var igroup = defaultGroup;
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
  userlist.forEach( userPid => {
    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: defaultGroup, uid: userPid, captain: 0, viceCaptain: 0});

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
      console.log(`Player: ${p.pid}   Score: ${myScore}  MF used: ${MF}`);
      userScoreList.push({ uid: userPid, pid: p.pid, playuserScore: myScore});
    });
    var totscore = _.sumBy(userScoreList, x => x.playuserScore);
    //if (userPid === 9) totscore = 873;  // for testing
    // do not assign rank. Just now. Will be assigned when info of all user grad score is available
    userRank.push({ uid: userPid, grandScore: totscore, rank: 0});
  })
  // now we have grand score of players per user.
  // sort by score (highest first) and rank
  userRank = _.sortBy(userRank, x => x.grandScore).reverse();
  // start raking
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
  //console.log(userRank);
  sendok(userRank);
});


async function update_cricapi_data_r1(logToResponse)
{
    let myindex;

    // 1st if time is up then get match details from cricapi
    if (timeToFetchMatches()) {
      // first get the team list
      var mytournament = await Tournament.find({ enabled: true });
      mytournament = _.map(mytournament, 'name');
      console.log(mytournament);
      var allTeams = await Team.find({tournament: {$in: mytournament}});
      //console.log(allTeams);

      //console.log("time to fetch match details");
      var existingmatches = await CricapiMatch.find({});
        
      // now get match details from cricapi
      var matchesFromCricapi = await fetchMatchesFromCricapi();
      if (matchesFromCricapi.matches == undefined) {
        console.log(matchesFromCricapi);
        var errmsg = "Could not fetch Match details from CricAPI"
        if (logToResponse)  senderr(CRICFETCHERR, errmsg)
        else                console.log(errmsg);
        return;
      }

      // next step update all the match details in mongoose
      matchesFromCricapi.matches.forEach(x => {
        var myTeam1 = x['team-1'].toUpperCase();
        var myTeam2 = x['team-2'].toUpperCase();
        //console.log(`Match Team1: ${myTeam1}  Team2: ${myTeam2}`)

        // do not consider match if team not yer decided
        if ((myTeam1 === "TBA") || (myTeam2 === "TBA")) return;

        // consider match only if team1 and team2 are part of our team list
        var isTeam = _.filter(allTeams, x => x.name == myTeam2);
        if (isTeam.length === 0) return;
        isTeam = _.filter(allTeams, x => x.name == myTeam1);
        if (isTeam.length === 0) return;
        // filter over

        // identify the tournament name
        var matchTournament = isTeam[0].tournament;
        console.log(`Match is part of ${matchTournament}`);

        var mymatch = _.find(existingmatches, m => m.mid == parseInt(x.unique_id));
        if (mymatch === undefined) {
          mymatch = new CricapiMatch();
        } 
        mymatch = getMatchDetails(x, mymatch, matchTournament);
        mymatch.save();
      });
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
  if (!(cricdata["man-of-the-match"] === undefined))
    manOfTheMatchPid = parseInt(cricdata["man-of-the-match"].pid);

  var allplayerstats = await tournamentStat.find({mid: mmm.mid});
  // update bowling details
  //console.log("Bowlong Started");
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
  //console.log("Batting started");
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
      if (!(batsman.B === undefined)) {
        var i = parseInt(batsman.B);
        if (isNaN(i))
          allplayerstats[myindex].ballsPlayed = 0;
        else
        allplayerstats[myindex].ballsPlayed = i;
      }
      if (allplayerstats[myindex].pid === manOfTheMatchPid)
        allplayerstats[myindex].manOfTheMatch = true;

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
    mymatch.team1 = cricapiRec['team-1'];
    mymatch.team2 = cricapiRec['team-2'];
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
    ((mystatrec.manOfTheMatch) ? BonusMOM : 0);

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
  // if (db_connection)
  //   update_cricapi_data_r1(false);
  // else
  //   console.log("============= No mongoose connection");
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

async function publish_stats(groupno)
{
  var myGroup = await IPLGroup.findOne({gid: groupno})
  // Set collection name 
  var tournamentStat = mongoose.model(myGroup.tournament, StatSchema);
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

