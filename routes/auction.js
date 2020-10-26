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

router.get('/add/:igroup/:iuser/:iplayer/:ibid', async function(req, res, next) {
  AuctionRes = res;
  setHeader();
  var {igroup,iuser,iplayer,ibid}=req.params;

  // if (isNaN(groupId)) { senderr(702, `Invalid Group ${groupId}`); return; }
  // var igroup = parseInt(groupId);
  
  var PallPlayers = Player.find({});
  var PauctionList = Auction.find({gid: igroup});
  var Pgmembers = GroupMember.findOne({gid: igroup, uid: iuser});
  var PgRec = IPLGroup.findOne({gid: igroup});

  // if (isNaN(userId)) { senderr(703, "Invalid User"); return;}
  // var iuser = parseInt(userId);
  // if (isNaN(playerId)) { senderr(704, "Invalid Player"); return;}
  // var iplayer = parseInt(playerId);
  // if (isNaN(bidValue)) { senderr(705, "Invalid bid amount"); return;} 
  // var ibid = parseInt(bidValue);
 
  // Step 1: validate group number
  var gRec = await PgRec;
  if (!gRec) { senderr(702, `Invalid Group ${igroup}`); return; }

  // Step 2: Validate user is member of the group
  var gmRec = await Pgmembers;
  if (!gmRec) {
    senderr(706, `User ${iuser} does not belong to Group 1`);
    return;
  }

  // Step 3: Player is part if the tournament configured in group.
  var allPlayers = await PallPlayers;
  console.log(`${gRec.tournament}   ${iplayer}`);
  var myplayer = _.find(allPlayers, {tournament: gRec.tournament, pid: parseInt(iplayer)});
  console.log(myplayer);
  if (!myplayer) {
    senderr(704, `Invalid player ${iplayer}`);
    return
  }

  // Step 4: Player is available for purchase
  var auctionList = await PauctionList;
  var tmp = _.find(auctionList, {pid: iplayer});
  if (tmp) {
    senderr(707, `Player ${iplayer} already purchased`);
    return;
  }

  // Step 5: User has not purchased maximum allowed player in auction
  myAuctionList = _.filter(auctionList, x => x.uid == iuser);
  if (myAuctionList.length === defaultMaxPlayerCount) {
    senderr(709, `Max player purchase count reached. Cannot buy additional player.`);
    return;
  }

  // Step 6: User has sufficient balance to purhcase the player at given bid amount
  var balance = gRec.maxBidAmount - _.sumBy(myAuctionList, x => x.bidAmount);
  if (balance < ibid ) {
    senderr(708, `Insufficient balance. Bid balance available is ${balance}`);
    return;
  }
  
  // All validation done. Now add player in user's kitty
  var bidrec = new Auction({ 
    uid: iuser,
    pid: iplayer,
    playerName: myplayer.name,
    team: myplayer.Team,
    gid: igroup,
    bidAmount: ibid 
  });
  //console.log(bidrec);
  bidrec.save();

  // now find all unsold players
  var soldPlayerId = _.map(auctionList, 'pid');

  // identify players who are still not sold and thus are available for purchase
  allPlayers = _.filter(allPlayers, x => 
    x.tournament == gRec.tournament &&
    !soldPlayerId.includes(x.pid)
    );

  var myindex = _.findIndex(allPlayers, (x) => { return x.pid == iplayer});
  ++myindex;
  if (myindex === allPlayers.length) myindex = 0;

  // update new player in Group auction player field and save
  gRec.auctionPlayer = allPlayers[myindex].pid;
  gRec.save();
  
  // calculate fresh balance for all users to be submitted to caller
  var gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = gRec.maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    if (gm.uid === iuser) {
      // this user has purchased just now new player with amount "ibit"
      // take care of if
      ++myPlayerCount;
      mybal = mybal - ibid;
    }
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

router.get('/nextbid/:groupId/:userId/:bidAmount', async function(req, res, next) {
  AuctionRes = res;
  setHeader();
  var {groupId,userId,bidAmount}=req.params;
  var tmp = await GroupMember.findOne({gid: groupId, uid: userId});
  if (!tmp) { senderr(702, `Invalid Group ${groupId}`); return; }    
  if 

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

function fetchBalance(gmembers, auctionList, maxBidAmount, iuser, ibid) {
  gmembers = _.sortBy(gmembers, 'uid');
  var balanceDetails = [];
  gmembers.forEach(gm => {
    myAuction = _.filter(auctionList, x => x.uid == gm.uid);
    var myPlayerCount = myAuction.length;
    var mybal = maxBidAmount - _.sumBy(myAuction, 'bidAmount');
    if (gm.uid === iuser) {
      // this user has purchased just now new player with amount "ibit"
      // take care of if
      ++myPlayerCount;
      mybal = mybal - ibid;
    }
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