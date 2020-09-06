var router = express.Router();
let AuctionRes;
var _group;
var _tournament;
/* GET users listing. */
router.use('/', function(req, res, next) {
  AuctionRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  _group = defaultGroup;
  _tournament = defaultTournament
  if (req.url == "/")
    publish_auctions({gid: _group});
  else
    next();
});

router.get('/add/:groupId/:userId/:playerId/:bidValue', async function(req, res, next) {
  AuctionRes = res;
  setHeader();

  var {groupId,userId,playerId,bidValue}=req.params;

  var igroup = _group;
  var grpstr = igroup.toString();

  if (groupId != grpstr) { senderr(702, "Invalid Group"); return; }
  var iuser = parseInt(userId);
  if (isNaN(iuser)) { senderr(703, "Invalid User"); return next;}
  var iplayer = parseInt(playerId);
  if (isNaN(iplayer)) { senderr(704, "Invalid Player"); return;}
  var ibid = parseInt(bidValue);
  if (isNaN(ibid)) { senderr(705, "Invalid bid amount"); return;} 

  console.log(igroup);
  console.log(iuser);
  console.log(iplayer);
  console.log(ibid);

  var gmember = await GroupMember.findOne({gid: igroup, uid: iuser});
  if (!gmember) {
    senderr(706, `User ${iuser} does not belong to Group 1`);
    return;
  }
  var myplayer = await Player.findOne({pid: iplayer});
  if (!myplayer) {
    senderr(704, "Invalid player");
    return
  }
  var myauction = await Auction.findOne({gid: igroup, pid:iplayer});
  if (myauction) {
    senderr(707, "Player already purchased");
    return;
  }

  console.log("Player available");
  var doc = await Auction.find({gid: igroup, uid: iuser});
  var balance = GROUP1_MAXBALANCE - _.sumBy(doc, x => x.bidAmount);
  console.log(balance);
  if (balance < ibid ) {
    senderr(708, `Insufficient balance. Bid balance available is ${balance}`);
    return;
  }

  console.log("Balance availab;e");
  var bidrec = new Auction({ 
    uid: iuser,
    pid: iplayer,
    playerName: myplayer.name,
    gid: igroup,
    bidAmount: ibid 
  });
  bidrec.save();
  balance = balance - ibid;
  sendok(`Added bid for player ${iplayer} with amount ${bidrec.bidAmount}> New Balance is ${balance}`);
});  // aution get



async function publish_auctions(auction_filter)
{
  auctionList = await Auction.find(auction_filter); 
  //console.log(auctionList)
  //const myOrderedArray = _.sortBy(myArray, o => o.name)
  auctionList = _.sortBy(auctionList, a => a.uid);
  sendok(auctionList);
}

function senderr(errcode, msg)  { AuctionRes.status(errcode).send(msg); }
function sendok(msg)   { AuctionRes.send(msg); }
function setHeader() {
  AuctionRes.header("Access-Control-Allow-Origin", "*");
  AuctionRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
