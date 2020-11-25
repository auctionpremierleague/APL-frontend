//const { template } = require("lodash");

router = express.Router();
var PlayerRes;
// var _group = 1;
// var _tournament = ""; //defaultTournament;

/* GET users listing. */
router.use('/', async function(req, res, next) {
  PlayerRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return};

  //console.log("In player router");
  // if (req.url == "/") {
  //   var myGroup = await IPLGroup.findOne({gid: _group});
  //   publish_players({tournament: myGroup.tournament});
  // } else
  //   next('route');
});


// get list of all players as per group
router.get('/group/:groupid', async function(req, res, next) {
  PlayerRes = res;
  setHeader();
  var {groupid}=req.params;
  if (isNan(groupid)) { senderr(682, `Invalid Group ${groupid}`); return; }
  var igroup = parseInt(groupid);
  var myGroup = await IPLGroup.findOne({gid: igroup});
  if (!myGroup) { senderr(682, `Invalid Group ${groupid}`); return; }

  publish_players({ tournament: myGroup.tournament } );
});


// get list of purchased players
router.get('/sold', async function(req, res, next) {
  PlayerRes = res;
  setHeader();
  //var {groupid}=req.params;
  var groupid = "1";
  if (isNaN(groupid)) { senderr(682, `Invalid Group ${groupid}`); return; }
  var igroup = parseInt(groupid);
  var myGroup = await IPLGroup.findOne({gid: igroup});
  if (!myGroup) { senderr(682, `Invalid Group ${groupid}`); return; }

  var alist = await Auction.find({gid: igroup});
  var mypid = _.map(alist, 'pid');
  publish_players({ tournament: myGroup.tournament, pid: { $in: mypid } } );
});

// get list of players not purchased (only 1 group)
router.get('/unsold', async function(req, res, next) {
  PlayerRes = res;
  setHeader();
  //var {groupid}=req.params;
  var groupid = "1";
  if (isNaN(groupid)) { senderr(682, `Invalid Group ${groupid}`); return; }
  var igroup = parseInt(groupid);
  var myGroup = await IPLGroup.findOne({gid: igroup});
  if (!myGroup) { senderr(682, `Invalid Group ${groupid}`); return; }

  var soldplayers = await Auction.find({gid: igroup});
  var soldpid = _.map(soldplayers, 'pid');

  publish_players({tournament: myGroup.tournament,  pid: { $nin: soldpid } } );
});


router.get('/updateauction', async function(req, res, next) {
  PlayerRes = res;
  setHeader();
  //var {groupid}=req.params;
  var auctionList = await Auction.find({gid: 1});
  var playerList = await Player.find({tournament: "IPL2020"});
  auctionList.forEach( a => {
    playerRec = _.find(playerList, x => x.pid === a.pid);
    a.team = playerRec.Team;
    a.save();
  });
  sendok("OK");
});




router.get('/available/:playerid', async function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var {playerid}=req.params;
  var groupid = "1";
  if (isNan(groupid)) { senderr(682, `Invalid Group ${groupid}`); return; }
  if (isNaN(playerid)) { senderr(681, `Invalid player id ${playerid}`); return; }
  var igroup = parseInt(groupid);
  var iplayer = parseInt(playerid);
  
  //  first confirm player id is correct
  var playerRec = await Auction.findOne({gid: igroup, pid: iplayer});
  sendok(playerRec === null);
});



async function publish_players(filter_players)
{
  //console.log(filter_players);
  var plist = await Player.find(filter_players);
  console.log(plist.length);
  sendok(plist);
}

function sendok(usrmsg) { PlayerRes.send(usrmsg); }
function senderr(errocode, errmsg) { PlayerRes.status(errocode).send(errmsg); }
function setHeader() {
  PlayerRes.header("Access-Control-Allow-Origin", "*");
  PlayerRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // _group = 1;
  // _tournament = defaultTournament;
}
module.exports = router;
