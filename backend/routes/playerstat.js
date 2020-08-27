var router = express.Router();
var PlayerStatRes;

/*
const cricapiKey = "iiyI0vNqKaS4Srie6thRQZe5hIi1";
const cricapiKey = "r4ZAGKxe9pdy9AuYzViW486eGI83";
r4ZAGKxe9pdy9AuYzViW486eGI83
LrNnasvQp0e2p5JfpAI5Q642o512
var cricapiMatchInfo = 
  `https://cricapi.com/api/matches?apikey=${cricapiKey}`;
var cricapi_MatchDetails =
  `https://cricapi.com/api/fantasySummary?apikey=${cricapiKey}&unique_id=`;
*/


/*
const keylist = ["bbdCNNOKBtPnL54mvGSgpToFUlA2",
                // padmavti mata from here
                "O9vYC5AxilYm7V0EkYkvRP5jF9B2","RTf9weNrX8Xn2ts1ksdzAXcuxnE3",
                "H2ObZFee6BVMN5kCjLxYCMwcEp52","kAWvFxmpeJZmbtyNeDLXtxUPrAH3",
                "EstH4EqbfEXMKXcS9M83k7cqUs13","ApVnpFFO6kgxTYXVwWQTEeiFVCO2",
                "72QuFkQezxf5IdqxV1CtGJrAtcn1"
                ];
*/

const keylist = [ "LrNnasvQp0e2p5JfpAI5Q642o512"];

const cricapiMatchInfo_prekey = "https://cricapi.com/api/matches?apikey=";
const cricapiMatchInfo_postkey = "";

var cricapi_MatchDetails_prekey = "https://cricapi.com/api/fantasySummary?apikey=";
var cricapi_MatchDetails_postkey = "&unique_id=";


/* GET all users listing. */
router.use('/', function(req, res, next) {
  PlayerStatRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == "/")
    publish_stats({});
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

router.use('/test2/:mid', async function(req, res, next) {
  PlayerStatRes = res;  
  setHeader();

  var {mid} = req.params;
  var i = parseInt(mid);
  var mydata = await Match.find({mid: i});
  console.log(`Starts at ${mydata[0].matchTime}`);  
  sendok(mydata);
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
  var igroup = 1;
  var gmembers = await GroupMember.find({gid: igroup});
  var auctionList = await Auction.find({gid: igroup});
  var statList = await Stat.find({});
  var captainlist = await Captain.find({gid: igroup});

  var userScoreList = [];    
  // now calculate score for each user
  gmembers.forEach( u  => {
    var userPid = u.uid;
    //console.log(`User: ${userPid}`);
    //var myUserScore = [];

    // find out captain and vice captain selected by user
    var capinfo = _.find(captainlist, x => x.gid == igroup && x.uid == userPid);
    if (capinfo === undefined)
      capinfo = new Captain ({ gid: 1, uid: userPid, captain: 0, viceCaptain: 0});

    // find out players of this user
    var myplayers = _.filter(auctionList, a => a.gid === igroup && a.uid === userPid); 
    //console.log(myplayers);
    //console.log("Just shown my players")
    //var playerScoreList = [];
    myplayers.forEach( p => {
      var MF = 1;
      if (p.pid === capinfo.ViceCaptain)
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



async function update_cricapi_data(logToResponse)
{
    let myindex;
  
    // now get match details from cricapi
    var matchesFromCricapi = await fetchMatchesFromCricapi();
    if (matchesFromCricapi.matches == undefined) {
      console.log(matchesFromCricapi);
      var errmsg = "Could not fetch Match details from CricAPI"
      if (logToResponse) 
        senderr(CRICFETCHERR, errmsg)
      else
        console.log(errmsg);
      return;
    }

    // get match record from database`
    var matchesFromDB = await CricapiMatch.find({});

    // get match info from cric api and find out which are new entries (i.e. were not therse in database)
    let newmatches = [];
    matchesFromCricapi.matches.forEach(x => {
      myindex = _.findIndex(matchesFromDB, {mid: x.unique_id});
      if (myindex >= 0 ) {
        matchesFromDB[myindex].matchStarted = x.matchStarted;
        matchesFromDB[myindex].squad = x.squad;
        //matchesFromDB[myindex].team1 = x['team-1'];
        //matchesFromDB[myindex].team2 = x['team-2'];
        matchesFromDB[myindex].save();    // update modification to mongoose
      } else {
        var teamannounced =  !((x['team-1']  === "TBA") || (x['team-2'] === "TBA"));
        // new matches which are not in our database. Also the team should have been announced
        if (teamannounced) {
          // new matches which are not in our database
          var mytime = new Date(x.dateTimeGMT);        // clone start date
          mytime.setMinutes(mytime.getMinutes() + minutesIST);
          var myweekday = weekDays[mytime.getDay()];
          var tmp = new CricapiMatch({
            mid: x.unique_id,  
            description: x['team-1'] + ' vs ' + x['team-2'],
            team1: x['team-1'], team2: x['team-2'],
            team1Description: x['team-1'], team2Description: x['team-2'],
            matchTime: mytime, weekDay: myweekday,
            type: x.type,
            //toss_winner_team: "",   //x.toss_winner_team, 
            squad: x.squad, matchStarted: x.matchStarted
          });
          newmatches.push(tmp);
        }
      }
    })

    // update new matches in datbase
    if (newmatches.length > 0) {
      await CricapiMatch.insertMany(newmatches);
      matchesFromDB = matchesFromDB.concat(newmatches);
    }
  
    // now get details of each match (only which have started)
    await matchesFromDB.forEach(async (x) => {
      if (x.matchStarted)
      {
        var afterStartTime = true;
        if (afterStartTime)
        {
          const mydata = await fetchMatchStatsFromCricapi(x.mid);
          // check if batting bowling of both the teams is over. 2 biatting and 2 bowling combile
          if ((mydata.data.bowling.length == 2) && (mydata.data.batting.length == 2))
          {
            updateMatchStats(x.mid, mydata.data.bowling, mydata.data.batting, 
              mydata.data["man-of-the-match"].pid);
          }
        }
      } 
    });
    console.log("Loop over. Job Done");
    if (logToResponse)
      sendok(matchesFromDB);
}

async function update_cricapi_data_r1(logToResponse)
{
    let myindex;

    // 1st if time is up then get match details from cricapi
    if (timeToFetchMatches()) {
      console.log("time to fetch match details");
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
        var teamannounced =  !((x['team-1']  === "TBA") || (x['team-2'] === "TBA"));
        if (teamannounced) {
          var mymatch = _.find(existingmatches, m => m.mid == parseInt(x.unique_id));
          if (mymatch === undefined) {
            mymatch = new CricapiMatch();
            //console.log("Creating blank record")
          } 
          // else
          //   console.log("Found existing match");
          mymatch = getMatchDetails(x, mymatch);
          mymatch.save();
        }
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
    console.log(`Matches started count ${matchesFromDB.length}`)

    // get stas of all these matches
    await matchesFromDB.forEach(async (mmm) => {
      //if (mmm.)
      if (mmm.matchStarted)
      {
        var afterStartTime = true;
        if (afterStartTime)
        {
          const mydata = await fetchMatchStatsFromCricapi(mmm.mid);
          var newstats = updateMatchStats_r1(mmm, mydata.data);
          // check if batting bowling of both the teams is over. 2 biatting and 2 bowling combile
          //if ((mydata.data.bowling.length == 2) && (mydata.data.batting.length == 2))
          //{
            //updateMatchStats(x.mid, mydata.data.bowling, mydata.data.batting, 
              //mydata.data["man-of-the-match"].pid);
          //}
        }
      } 
    });
    return;

    // get match info from cric api and find out which are new entries (i.e. were not therse in database)
    //let newmatches = [];
    matchesFromCricapi.matches.forEach(x => {
      myindex = _.findIndex(matchesFromDB, {mid: x.unique_id});
      if (myindex >= 0 ) {
        matchesFromDB[myindex].matchStarted = x.matchStarted;
        matchesFromDB[myindex].squad = x.squad;
        //matchesFromDB[myindex].team1 = x['team-1'];
        //matchesFromDB[myindex].team2 = x['team-2'];
        matchesFromDB[myindex].save();    // update modification to mongoose
      } else {
        var teamannounced =  !((x['team-1']  === "TBA") || (x['team-2'] === "TBA"));
        // new matches which are not in our database. Also the team should have been announced
        if (teamannounced) {
          // new matches which are not in our database
          var mytime = new Date(x.dateTimeGMT);        // clone start date
          mytime.setMinutes(mytime.getMinutes() + minutesIST);
          var myweekday = weekDays[mytime.getDay()];
          var tmp = new CricapiMatch({
            mid: x.unique_id,  
            description: x['team-1'] + ' vs ' + x['team-2'],
            team1: x['team-1'], team2: x['team-2'],
            team1Description: x['team-1'], team2Description: x['team-2'],
            matchTime: mytime, weekDay: myweekday,
            type: x.type,
            //toss_winner_team: "",   //x.toss_winner_team, 
            squad: x.squad, matchStarted: x.matchStarted
          });
          newmatches.push(tmp);
        }
      }
    })

    // update new matches in datbase
    if (newmatches.length > 0) {
      await CricapiMatch.insertMany(newmatches);
      matchesFromDB = matchesFromDB.concat(newmatches);
    }
  
    // now get details of each match (only which have started)
    await matchesFromDB.forEach(async (x) => {
      if (x.matchStarted)
      {
        var afterStartTime = true;
        if (afterStartTime)
        {
          const mydata = await fetchMatchStatsFromCricapi(x.mid);
          // check if batting bowling of both the teams is over. 2 biatting and 2 bowling combile
          if ((mydata.data.bowling.length == 2) && (mydata.data.batting.length == 2))
          {
            updateMatchStats(x.mid, mydata.data.bowling, mydata.data.batting, 
              mydata.data["man-of-the-match"].pid);
          }
        }
      } 
    });
    console.log("Loop over. Job Done");
    if (logToResponse)
      sendok(matchesFromDB);
}


/*
 * Working function
 * This function read the details after the complete match is over
 */


function updateMatchStats(matchid, bowlingArray, battingArray, manOfTheMatchPid)
{
  var allplayerstats = [];
  var currMatch = parseInt(matchid);

  console.log(`Match: ${matchid} data update`)  
  bowlingArray.forEach( x => {
    x.scores.forEach(bowler => {
      myindex = _.findIndex(allplayerstats, {mid: currMatch, pid: parseInt(bowler.pid)});
      if (myindex < 0) {
        var tmp = getBlankStatRecord();
        tmp.mid = currMatch;
        tmp.pid = bowler.pid;
        tmp.playerName = bowler.bowler;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      allplayerstats[myindex].wicket = bowler.W;
      allplayerstats[myindex].wicket5 = (bowler.W >= 5) ? 1 : 0;
      allplayerstats[myindex].wicket3 = ((bowler.W >= 3) && (bowler.W < 5)) ? 1 : 0;
      allplayerstats[myindex].hattrick = 0;
      allplayerstats[myindex].maiden = bowler.M
      if (allplayerstats[myindex].pid == manOfTheMatchPid)
        allplayerstats[myindex].manOfTheMatch = true;
    });
  });
  // update batting details
  battingArray.forEach( x => {
    x.scores.forEach(batsman => {
      myindex = _.findIndex(allplayerstats, {mid: currMatch, pid: parseInt(batsman.pid)});
      if (myindex < 0) {
        var tmp = getBlankStatRecord();
        tmp.mid = currMatch;
        tmp.pid = batsman.pid;
        tmp.playerName = batsman.batsman;
        allplayerstats.push(tmp);
        myindex = allplayerstats.length - 1;
      }
      allplayerstats[myindex].run = batsman.R;
      allplayerstats[myindex].fifty = ((batsman.R >= 50) && (batsman.R < 100)) ? 1 : 0;
      allplayerstats[myindex].hundred = (batsman.R >= 100) ? 1 : 0;
      allplayerstats[myindex].four = batsman["4s"];
      allplayerstats[myindex].six = batsman["6s"];
      if (allplayerstats[myindex].pid == manOfTheMatchPid)
        allplayerstats[myindex].manOfTheMatch = true;
    });
  });
  // even though have have create match stats for all bowlers and batsman
  // make sure that they do not get updated repeatedly. Thus update in mongoose
  // only if entry of player stat of this match not already in database.
  // Also not that there will be only 1 match with this MID, thus data will get
  // updated 1st time. However repatedly it will not be saved again and again
  allplayerstats.forEach( x => {
    Stat.findOne({mid: x.mid, pid: x.pid}, function(err, statrec) {
      if (!statrec) {
        x.save();
      }
    });
  });
}

async function updateMatchStats_r1(mmm, cricdata)
{
  //var matchid = mmm.mid;
  var currMatch = mmm.mid;
  console.log(`Match: ${currMatch} data update`)  
  
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


  console.log(`Batting count: ${battingArray.length} Bowling array ${bowlingArray.length}`);
  if ((battingArray.length + bowlingArray.length) === 0) { 
    console.log("No Batting Bowling data");
    return;
  }

  var manOfTheMatchPid = 0;  
  if (!(cricdata["man-of-the-match"] === undefined))
    manOfTheMatchPid = parseInt(cricdata["man-of-the-match"].pid);

  var allplayerstats = await Stat.find({mid: mmm.mid});

  // update bowling details
  bowlingArray.forEach( x => {
    x.scores.forEach(bowler => {
      myindex = _.findIndex(allplayerstats, {mid: currMatch, pid: parseInt(bowler.pid)});
      if (myindex < 0) {
        var tmp = getBlankStatRecord();
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
      allplayerstats[myindex].score = 0;  //calculateScore(allplayerstats[myindex]);
      var myscore = calculateScore(allplayerstats[myindex]);
      allplayerstats[myindex].score = myscore;
      console.log(`Score; ${myscore}  Details: ${allplayerstats[myindex]}`);
    });
  });

  // update batting details
  battingArray.forEach( x => {
    x.scores.forEach(batsman => {
      myindex = _.findIndex(allplayerstats, {mid: currMatch, pid: parseInt(batsman.pid)});
      if (myindex < 0) {
        var tmp = getBlankStatRecord();
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
      allplayerstats[myindex].score = 0;  //calculateScore(allplayerstats[myindex]);
      var myscore = calculateScore(allplayerstats[myindex]);
      allplayerstats[myindex].score = myscore;
      console.log(`Score; ${myscore} `);
    });
  });

  // update statistics in mongoose
  //console.log(allplayerstats.length);
  //console.log("Saveing statsu");
  allplayerstats.forEach(ps => {
    ps.save();
  })
  //allplayerstats.save();
  var currdate = new Date();
  console.log(`Match Id: ${mmm.mid} Curr Date: ${currdate}  matchenddate: ${mmm.matchEndTime}`);
  if (mmm.matchEndTime < new Date()) {
    mmm.matchEnded = true;
    mmm.save();
  }
  return;
}


function getMatchDetails(cricapiRec, mymatch) {
  var stime = getMatchStartTime(cricapiRec);
  var etime = getMatchEndTime(cricapiRec);
  var myweekday = weekDays[stime.getDay()];
  
  //var tmp = new CricapiMatch({
    mymatch.mid = cricapiRec.unique_id;
    mymatch.description = cricapiRec['team-1'] + ' vs ' + cricapiRec['team-2'];
    mymatch.team1 = cricapiRec['team-1'];
    mymatch.team2 = cricapiRec['team-2'];
    mymatch.team1Description = cricapiRec['team-1'];
    mymatch.team2Description = cricapiRec['team-2'];
    mymatch.matchStartTime = stime;
    mymatch.weekDay = myweekday;
    mymatch.type = cricapiRec.type;
    //toss_winner_team: "",   //x.toss_winner_team, 
    mymatch.squad = cricapiRec.squad;
    mymatch.matchStarted = cricapiRec.matchStarted;
    mymatch.matchEndTime = etime;
    mymatch.matchEnded = false;

    return mymatch;
}


function getBlankStatRecord() {
  return new Stat( {
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

// function getMatchRec(cricapiRec) {
//   return tmp;
// }



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
cron.schedule('*/15 * * * *', () => {
  console.log('==========running every minute 15 minutes');
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
  console.log(`Next FetchTime: ${nextMatchFetchTime}`);
  if (currtime >= nextMatchFetchTime)
    return true;
  else
    return false;
}

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
  } else {
    matchHours = t20Hours;
  }

  // addd match time to end date
  etime.setHours(etime.getHours() + matchHours);

  return etime;
}

function publish_stats(filter_stats)
{
  //console.log(filter_stats);
  Stat.find(filter_stats,(err,slist) =>{
    if(slist) sendok(slist);
    else      senderr(DBFETCHERR, "Unable to fetch statistics from database");
  });
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

