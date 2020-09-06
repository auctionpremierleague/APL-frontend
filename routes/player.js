const { template } = require("lodash");

router = express.Router();
var PlayerRes;
var _group = 1;
var _tournament = "IPL2020";

/* GET users listing. */
router.use('/', async function(req, res, next) {
  PlayerRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return};

  //console.log("In player router");
  if (req.url == "/") {
    var allTeams = await Team.find({tournament: _tournament});  
    var teamName = _.map(allTeams, 'name');
    publish_players({tournament: _tournament,  Team: {$in: teamName} });
  } else
    next('route');
});


// get list of purchased players
router.get('/sold', async function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var alist = await Auction.find({gid: _group});
  var mypid = _.map(alist, 'pid');
  publish_players({ pid: { $in: mypid } } );
});

// get list of players not purchased (only 1 group)
router.get('/unsold', async function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var myteam = await Team.find({tournament: _tournament});
  var teamname = _.map(myteam, 'name');
  //console.log(teamname);

  var soldplayers = await Auction.find({gid: _group});
  var mypid = _.map(soldplayers, 'pid');

  publish_players({tournament: _tournament, Team: {$in: teamname},  pid: { $nin: mypid } } );
});


router.get('/available/:playerid', async function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var {playerid}=req.params;
  var iplayer = parseInt(playerid);
  if (isNaN(iplayer)) { senderr(681, `Invalid player id ${playerid}`); return; }
  
  //  first confirm player id is correct
  var playerRec = await Auction.findOne({gid: _group, pid: iplayer});
  sendok(playerRec === null);
});



async function publish_players(filter_players)
{
  //console.log(filter_players);
  var plist = await Player.find(filter_players);
  sendok(plist);
}

function sendok(usrmsg) { PlayerRes.send(usrmsg); }
function senderr(errocode, errmsg) { PlayerRes.status(errocode).send(errmsg); }
function setHeader() {
  PlayerRes.header("Access-Control-Allow-Origin", "*");
  PlayerRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

}
module.exports = router;