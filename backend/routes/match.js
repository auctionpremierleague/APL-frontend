var router = express.Router();
var MatchRes;

/* GET all users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  MatchRes = res;
  if (!db_connection) { senderr(ERR_NODB); return; }

  var tmp = req.url.split('/');
  if (tmp[1].toUpperCase() != "DATE")
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
  console.log("Modified: " + req.url);
  next('route');
});


/* GET all matches of given listing. */
router.use('/list/:myteam1/:myteam2', function(req, res, next) {
  MatchRes = res;
  var {myteam1,myteam2} = req.params;
  myteam1 = myteam1.toUpperCase();
  myteam2 = myteam2.toUpperCase();
  //console.log("Single entry " + myteam1);
  //console.log("Single entry " + myteam2);

  let myfilter;
  if (myteam1 == "ALL")  
    myfilter = {};
  else if (myteam2 == "NONE") 
    myfilter = {$or: [ {team1: myteam1}, {team2: myteam1} ]};
  else
    myfilter = {team1: {$in: [myteam1, myteam2]}, team2: {$in: [myteam1, myteam2]} };
    //console.log(myfilter);
  publish_matches(myfilter);
});


/* GET all matches to be held on give date */
router.use('/date/:mydate', function(req, res, next) {
  MatchRes = res;
  var {mydate} = req.params;
  var startDate, endDate;

  startDate =   new Date(mydate);
  if (isNaN(startDate)) { senderr(`Invalid date ${mydate}`); return; }
  
  endDate = new Date(startDate.getTime());        // clone start date
  endDate.setDate(startDate.getDate()+1);
  endDate.setHours(0);
  endDate.setMinutes(0);
  endDate.setSeconds(0);
  
  var currdate = new Date();
  console.log(`Curr Date: ${currdate} Start Date: ${startDate}   End Date: ${endDate}`);

  //Income.find({owner: userId, date: { $gte: start, $lt: end }}, callback);
  let myfilter = { matchTime: { $gte: startDate, $lt: endDate } };
  publish_matches(myfilter);
});


async function publish_matches(myfilter)
{
  //console.log(myfilter);
    var matchlist = await Match.find(myfilter);
    
    sendok(matchlist);
}

function sendok(usrmsg) { MatchRes.send(usrmsg); }
function senderr(errmsg) { MatchRes.send(errmsg); }
module.exports = router;
