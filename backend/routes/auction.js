var router = express.Router();
let AuctionRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  AuctionRes = res;
  if (!db_connection) { senderr(ERR_NODB); return; }

  if (req.url == "/")
    publish_auctions({});
  else
    next();
});

router.get('/add/:groupId/:userId/:playerId/:bidValue', function(req, res, next) {
  AuctionRes = res;

  var {groupId,userId,playerId,bidValue}=req.params;
  // only operation currently supported is ADD
  // oper = oper.toLowerCase();
  // if (oper != "add") { senderr("Invalid operation for aution"); return; }
  if (groupId != "1") { senderr("Invalid Group"); return; }
  var igroup = 1;

  var iuser = parseInt(userId);
  if (isNaN(iuser)) { senderr("Invalid User"); return next;}
  var iplayer = parseInt(playerId);
  if (isNaN(iplayer)) { senderr("Invalid Player"); return;}
  var ibid = parseInt(bidValue);
  if (isNaN(ibid)) { senderr("Invalid bid amount"); return;} 

  var oper = "ADD";
  console.log(oper);
  console.log(igroup);
  console.log(iuser);
  console.log(iplayer);
  console.log(ibid);

  GroupMember.find({gid:1, uid: iuser}).countDocuments(function(err, count) {
    if (err)
      senderr(err);
    else if (count != 1)
      senderr(`User ${iuser} does not belong to Group 1`);
    else {
      // user correct and belongs to group. Now check player is correct
      Player.find({pid:iplayer}).countDocuments(function(err, pcount) {
      if (err)
        senderr(err);
      else if (pcount != 1)
        senderr("Invalid player");
      else {
        // user and players valid. Now check player is already purchased
        Auction.find({gid: igroup,pid:iplayer}).countDocuments(function(err, result) {
          if (err) {senderr(err); return;}
          else if (result > 0) {senderr("Already purchased"); return;}
          else {
            console.log("Player available");
            Auction.find({gid: 1, uid: iuser}).exec(function (err, doc) {
              if (err) senderr(err);
              else {
                // const balance = GROUP1_MAXBALANCE - doc.reduce((accum, userrec) => {
                //     return accum + userrec.bidAmount;
                // }, 0);
                var balance = GROUP1_MAXBALANCE - _.sumBy(doc, x => x.bidAmount);
                console.log(balance);
                if (balance < ibid ) senderr(`Insufficient balance. Bid balance available is ${balance}`);
                else {
                  console.log("Balance availab;e");
                  var bidrec = new Auction({ uid: iuser,
                    pid: iplayer,
                    gid: 1,
                    bidAmount: ibid 
                  });
                  bidrec.save(function(err) {
                    if (err) senderr("Could not add new Auction record");
                    else sendok(`Added bid for player ${iplayer} with amount ${bidrec.bidAmount}`);
                  }); 
                }
              }
            });          
          }
        });
      }   
    });  // players find   
    }
  }); // user find    
});  // aution get



async function publish_auctions(auction_filter)
{
  auctionList = await Auction.find(auction_filter); 
  //console.log(auctionList)
  //const myOrderedArray = _.sortBy(myArray, o => o.name)
  auctionList = _.sortBy(auctionList, a => a.uid);
  sendok(auctionList);
}

function senderr(msg)  { AuctionRes.send(msg); }
function sendok(msg)   { AuctionRes.send(msg); }
module.exports = router;
