var router = express.Router();
var MatchRes;
var _group;
var _tournament;

/* GET all users listing. */
router.use('/', function(req, res, next) {
  MatchRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR,  ERR_NODB); return; }
  
  var tmp = req.url.split('/');
  if (!["DATE"].includes(tmp[1].toUpperCase()))
  {
    // take care of /list/csk  ,   /list/csk/rr,  /list
    switch (tmp.length)
    {
      case 2:  
        if (tmp[1].length == 0) tmp[1] = "all";
        req.url = "/list/" + tmp[1] + "/none";
        break;
      case 3:
        if (tmp[2].length == 0) 
          tmp[2] = "none";
        req.url = "/list/" + tmp[1] + "/" + tmp[2];
        break;  
      case 4: 
        if (tmp[3].length == 0) 
          req.url = "/list/" + tmp[1] + "/" + tmp[2];
        break;
    }
  }
  //console.log("Modified: " + req.url);
  next('route');
});


/* GET all matches of given listing. */
router.use('/list/:myteam1/:myteam2', function(req, res, next) {
  MatchRes = res;
  setHeader();

  var {myteam1,myteam2} = req.params;
  myteam1 = myteam1.toUpperCase();
  myteam2 = myteam2.toUpperCase();
  //console.log("Single entry " + myteam1);
  //console.log("Single entry " + myteam2);

  let myfilter;
  if (myteam1 == "ALL")  
    myfilter = {tournament: _tournament};
  else if (myteam2 == "NONE") 
    myfilter = {tournament: _tournament, $or: [ {team1: myteam1}, {team2: myteam1} ]};
  else
    myfilter = {tournament: _tournament, team1: {$in: [myteam1, myteam2]}, team2: {$in: [myteam1, myteam2]} };
    //console.log(myfilter);
  publish_matches(myfilter);
});

// GET all matches to be held on give date 
/*
router.use('/today', function(req, res, next) {
  MatchRes = res;
  setHeader();
  req.url = '/date/today';
  next('route');
});
*/

// GET all matches to be held on give date 
router.use('/date/:mydate', function(req, res, next) {
  MatchRes = res;
  setHeader();
  var {mydate} = req.params;
  var todayDate = new Date();

  var maxDayRange = 1;
  switch (mydate.toUpperCase())
  {
    case "UPCOMING":
      //todayDate.setDate(todayDate.getDate()-10);
      mydate = todayDate.getFullYear().toString() + "-" +
              (todayDate.getMonth()+1).toString() + "-" +
              todayDate.getDate().toString() + " " +
              todayDate.getHours().toString() + ":" +
              todayDate.getMinutes().toString();
      maxDayRange = 200;
      break;
    case "TODAY":
      mydate = todayDate.getFullYear().toString() + "-" +
              (todayDate.getMonth()+1).toString() + "-" +
              todayDate.getDate().toString();
      break;
    case "YESTERDAY":
      todayDate.setDate(todayDate.getDate()-1);
      mydate = todayDate.getFullYear().toString() + "-" +
              (todayDate.getMonth()+1).toString() + "-" +
              todayDate.getDate().toString();
      break;
    case "TOMORROW":
      todayDate.setDate(todayDate.getDate()+1);
      mydate = todayDate.getFullYear().toString() + "-" +
              (todayDate.getMonth()+1).toString() + "-" +
              todayDate.getDate().toString();
      break;
  }
  console.log(`Date: ${mydate} and Range ${maxDayRange}`)
  var startDate, endDate;
  startDate =   new Date(mydate);
  if (isNaN(startDate)) { senderr(661, `Invalid date ${mydate}`); return; }
  endDate = new Date(startDate.getTime());        // clone start date
  endDate.setDate(startDate.getDate()+maxDayRange);
  endDate.setHours(0);
  endDate.setMinutes(0);
  endDate.setSeconds(0);
  
  //var currdate = new Date();
  //console.log(`Curr Date: ${currdate} Start Date: ${startDate}   End Date: ${endDate}`);
  let myfilter = { tournament: _tournament, matchStartTime: { $gte: startDate, $lt: endDate } };
  publish_matches(myfilter);
});

async function publish_matches(myfilter)
{
  // console.log(myfilter);
  var matchlist = await CricapiMatch.find(myfilter);  
  sendok(matchlist);
}
async function publish_matches_r0(myfilter)
{
  //console.log(myfilter);
    var matchlist = await Match.find(myfilter);
    
    sendok(matchlist);
}

function sendok(usrmsg) { MatchRes.send(usrmsg); }
function senderr(errcode, errmsg) { MatchRes.status(errcode).send(errmsg); }
function setHeader() {
  MatchRes.header("Access-Control-Allow-Origin", "*");
  MatchRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament;
}
module.exports = router;