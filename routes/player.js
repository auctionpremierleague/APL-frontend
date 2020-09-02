router = express.Router();
var PlayerRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  PlayerRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return};

  //console.log("In player router");
  if (req.url == "/")
    publish_players({});
  else
    next('route');
});


// get list of purchased players
router.get('/sold', function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var mypid = [];
  Auction.find({gid:1}, (err, alist) => {
    alist.forEach(auction_element => { 
      mypid.push(auction_element.pid) 
    });
    //console.log(mypid);
    publish_players({ pid: { $in: mypid } } );
  });
});

// get list of players not purchased (only 1 group)
router.get('/unsold', function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var mypid = [];
  Auction.find({gid:1}, (err, alist) => {
    alist.forEach(auction_element => { 
      mypid.push(auction_element.pid) 
    });
    //console.log(mypid);
    publish_players({ pid: { $nin: mypid } } );
  });
});


router.get('/available/:playerid', function(req, res, next) {
  PlayerRes = res;
  setHeader();

  var {playerid}=req.params;
  var iplayer = parseInt(playerid);
  if (isNaN(iplayer)) { senderr(681, `Invalid player id ${playerid}`); return; }
  
  //  first confirm player id is correct
  Auction.find({gid: 1, pid:iplayer}).countDocuments(function(err, acount) {
    if (err)
      senderr(DBFETCHERR, DBerr);
    else
      sendok(acount == 0);
  });
});



async function publish_players(filter_players)
{
  //console.log(filter_players);
  var plist = await Player.find(filter_players);
  //ulist = _.map(ulist, o => _.pick(o, ['uid', 'userName', 'displayName']));
  plist = _.map(plist, p => _.pick(p, ['pid', 'name', 'fullName', 'Team', 'role', 'bowlingStyle', 'battingStyle']));
  sendok(plist);
}

function sendok(usrmsg) { PlayerRes.send(usrmsg); }
function senderr(errocode, errmsg) { PlayerRes.status(errocode).send(errmsg); }
function setHeader() {
  PlayerRes.header("Access-Control-Allow-Origin", "*");
  PlayerRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

}
module.exports = router;
