var router = express.Router();
let AuctionRes;
var _group;
var _tournament;
/* GET users listing. */
router.use('/', function(req, res, next) {
  AuctionRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == "/")
    publish_auctions({gid: _group});
  else
    next();
});

router.get('/add_orig/:groupId/:userId/:playerId/:bidValue', async function(req, res, next) {
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

  // check if user has already purchased maximum allowed players. If yes then throw error
  if (doc.length === defaultMaxPlayerCount) {
    senderr(709, `Max player purchase count reached. Cannot buy additional player.`);
    return;
  }

  // cgeck if user has sufficent balance points to purhcase the player at given bid amount
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

router.get('/add/:groupId/:userId/:playerId/:bidValue', async function(req, res, next) {
  AuctionRes = res;
  setHeader();
  var {groupId,userId,playerId,bidValue}=req.params;

  if (isNaN(groupId)) { senderr(702, `Invalid Group ${groupId}`); return; }
  var igroup = parseInt(groupId);
  
  var PallPlayers = Player.find({});
  var PauctionList = Auction.find({gid: igroup});
  var Pgmembers = GroupMember.find({gid: igroup});
  var PmyGroup = IPLGroup.find({gid: igroup});

  if (isNaN(userId)) { senderr(703, "Invalid User"); return;}
  var iuser = parseInt(userId);
  if (isNaN(playerId)) { senderr(704, "Invalid Player"); return;}
  var iplayer = parseInt(playerId);
  if (isNaN(bidValue)) { senderr(705, "Invalid bid amount"); return;} 
  var ibid = parseInt(bidValue);
 
  // validate group number
  var myGroup = await PmyGroup;
  if (myGroup.length != 1) { senderr(702, `Invalid Group ${groupId}`); return; }

  // confirm user is member of specified group
  var gmembers = await Pgmembers;
  var gmRec = _.find(gmembers, {uid: iuser});
  if (!gmRec) {
    senderr(706, `User ${iuser} does not belong to Group 1`);
    return;
  }

  // check if player already purchase during auction
  var auctionList = await PauctionList;
  var tmp = _.find(auctionList, {pid: iplayer});
  if (tmp) {
    senderr(707, `Player ${iplayer} already purchased`);
    return;
  }

  // Player is not purhased. Check if palyer id correct
  var allPlayers = await PallPlayers;
  var myplayer = _.find(allPlayers, {tournament: myGroup[0].tournament, pid: iplayer});
  if (!myplayer) {
    senderr(704, `Invalid player ${iplayer}`);
    return
  }

  // make list of players purchsed by the user
  myAuctionList = _.filter(auctionList, x => x.uid == iuser);
  // check if user has already purchased maximum allowed players. If yes then throw error
  if (myAuctionList.length === defaultMaxPlayerCount) {
    senderr(709, `Max player purchase count reached. Cannot buy additional player.`);
    return;
  }
  // check if user has sufficent balance points to purhcase the player at given bid amount
  var balance = myGroup[0].maxBidAmount - _.sumBy(myAuctionList, x => x.bidAmount);
  if (balance < ibid ) {
    senderr(708, `Insufficient balance. Bid balance available is ${balance}`);
    return;
  }

  var bidrec = new Auction({ 
    uid: iuser,
    pid: iplayer,
    playerName: myplayer.name,
    gid: igroup,
    bidAmount: ibid 
  });
  //console.log(bidrec);
  bidrec.save();

  // now find all unsold players
  var soldPlayerId = _.map(auctionList, 'pid');

  // identify players who are still not sold
  allPlayers = _.filter(allPlayers, x => 
    x.tournament == myGroup[0].tournament &&
    !soldPlayerId.includes(x.pid)
    );

  // let index = _.findIndex(array1, (e) => { 
  //   return e == 1; 
  // }, 0); 
  var myindex = _.findIndex(allPlayers, (x) => { return x.pid == iplayer});
  ++myindex;
  if (myindex === allPlayers.length) myindex = 0;

    // update new player in Group auction player field and save
    myGroup[0].auctionPlayer = allPlayers[myindex].pid;
    myGroup[0].save();
  
  
  // calculate fresh balance for all users
  gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = myGroup[0].maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    if (gm.uid === iuser) mybal = mybal - ibid;
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.userName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });

  const socket = app.get("socket");
  socket.emit("playerChange", allPlayers[myindex], balanceDetails)
  socket.broadcast.emit('playerChange', allPlayers[myindex], balanceDetails);
  sendok(allPlayers[myindex]);
});

// to provide next player available for auction
router.get('/skip/:groupId/:playerId', async function(req, res, next) {
  AuctionRes = res;
  setHeader();
  var {groupId,playerId}=req.params;

  if (isNaN(groupId)) { senderr(702, `Invalid Group ${groupId}`); return; }
  var igroup = parseInt(groupId);
  
  var PallPlayers = Player.find({});
  var PmyGroup = IPLGroup.find({gid: igroup});
  var PauctionList = Auction.find({gid: igroup});
  var Pgmembers = GroupMember.find({gid: igroup});

  if (isNaN(playerId)) { senderr(704, "Invalid Player"); return;}
  var iplayer = parseInt(playerId);
 
  // validate group number
  var myGroup = await PmyGroup;
  if (myGroup.length != 1) { senderr(702, `Invalid Group ${groupId}`); return; }

  // make sold player list pid
  var auctionList = await PauctionList;
  var soldPlayerId = _.map(auctionList, 'pid');

  var allPlayers = await PallPlayers;
  var allPlayers = _.filter(allPlayers, x => x.tournament == myGroup[0].tournament);
  var myplayer = _.find(allPlayers, {tournament: myGroup[0].tournament, pid: iplayer});
  if (!myplayer) {
    senderr(704, `Invalid player ${iplayer}`);
    return
  }

  // make list of players purchsed by the user
  // myAuctionList = _.filter(auctionList, x => x.uid == iuser);
  // // check if user has already purchased maximum allowed players. If yes then throw error
  // if (myAuctionList.length === defaultMaxPlayerCount) {
  //   senderr(709, `Max player purchase count reached. Cannot buy additional player.`);
  //   return;
  // }

  // check if user has sufficent balance points to purhcase the player at given bid amount
  // var balance = myGroup[0].maxBidAmount - _.sumBy(myAuctionList, x => x.bidAmount);
  // if (balance < ibid ) {
  //   senderr(708, `Insufficient balance. Bid balance available is ${balance}`);
  //   return;
  // }

  // var bidrec = new Auction({ 
  //   uid: iuser,
  //   pid: iplayer,
  //   playerName: myplayer.name,
  //   gid: igroup,
  //   bidAmount: ibid 
  // });
  // console.log(bidrec);
  // //bidrec.save();


  // identify players who are still not sold
  allPlayers = _.filter(allPlayers, x => x.tournament == myGroup[0].tournament);
  var myindex = _.findIndex(allPlayers, (x) => { return x.pid == iplayer});
  ++myindex;
  if (myindex === allPlayers.length) myindex = 0;
  while (true) {
    if (!soldPlayerId.includes(allPlayers[myindex].pid)) break;
    ++myindex;
  }

  // update new player in Group auction player field and save
  myGroup[0].auctionPlayer = allPlayers[myindex].pid;
  myGroup[0].save();

  // calculate fresh balance for all users
  var gmembers = await Pgmembers;
  gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = myGroup[0].maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    balanceDetails.push({
      uid: gm.uid,
      userName: gm.userName,
      gid: gm.gid,
      playerCount: myPlayerCount,
      balance: mybal
    });
  });

  const socket = app.get("socket");
  socket.emit("playerChange", allPlayers[myindex], balanceDetails)
  socket.broadcast.emit('playerChange', allPlayers[myindex], balanceDetails);
  sendok(allPlayers[myindex]);
});

async function publish_auctions(auction_filter)
{
  auctionList = await Auction.find(auction_filter); 
  //console.log(auctionList)
  //const myOrderedArray = _.sortBy(myArray, o => o.name)
  auctionList = _.sortBy(auctionList, a => a.uid);
  sendok(auctionList);
}

const fetchBalance = async () => {
  var grpFilter = { gid: _group };

  let gmRec = await GroupMember.find(grpFilter);
  var auctionList = await Auction.find(grpFilter);
  gmRec = _.sortBy(gmRec, 'uid');

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

function senderr(errcode, msg)  { AuctionRes.status(errcode).send(msg); }
function sendok(msg)   { AuctionRes.send(msg); }
function setHeader() {
  AuctionRes.header("Access-Control-Allow-Origin", "*");
  AuctionRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  _group = defaultGroup;
  _tournament = defaultTournament
}
module.exports = router;