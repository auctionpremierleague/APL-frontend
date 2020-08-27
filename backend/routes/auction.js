var router = express.Router();
let AuctionRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  AuctionRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == "/")
    publish_auctions({});
  else
    next();
});

router.get('/add/:groupId/:userId/:playerId/:bidValue', function(req, res, next) {
  AuctionRes = res;
  setHeader();

  var {groupId,userId,playerId,bidValue}=req.params;
  // only operation currently supported is ADD
  // oper = oper.toLowerCase();
  // if (oper != "add") { senderr(701, "Invalid operation for aution"); return; }
  if (groupId != "1") { senderr(702, "Invalid Group"); return; }
  var igroup = 1;

  var iuser = parseInt(userId);
  if (isNaN(iuser)) { senderr(703, "Invalid User"); return next;}
  var iplayer = parseInt(playerId);
  if (isNaN(iplayer)) { senderr(704, "Invalid Player"); return;}
  var ibid = parseInt(bidValue);
  if (isNaN(ibid)) { senderr(705, "Invalid bid amount"); return;} 

  var oper = "ADD";
  console.log(oper);
  console.log(igroup);
  console.log(iuser);
  console.log(iplayer);
  console.log(ibid);

  GroupMember.find({gid:1, uid: iuser}).countDocuments(function(err, count) {
    if (err)
      senderr(DBFETCHERR, err);
    else if (count != 1)
      senderr(706, `User ${iuser} does not belong to Group 1`);
    else {
      // user correct and belongs to group. Now check player is correct
      Player.find({pid:iplayer}).countDocuments(function(err, pcount) {
      if (err)
        senderr(DBFETCHERRerr);
      else if (pcount != 1)
        senderr(704, "Invalid player");
      else {
        // user and players valid. Now check player is already purchased
        Auction.find({gid: igroup,pid:iplayer}).countDocuments(function(err, result) {
          if (err) {senderr(DBFETCHERR, err); return;}
          else if (result > 0) {senderr(707, "Already purchased"); return;}
          else {
            console.log("Player available");
            Auction.find({gid: 1, uid: iuser}).exec(function (err, doc) {
              if (err) senderr(DBFETCHERR, err);
              else {
                // const balance = GROUP1_MAXBALANCE - doc.reduce((accum, userrec) => {
                //     return accum + userrec.bidAmount;
                // }, 0);
                var balance = GROUP1_MAXBALANCE - _.sumBy(doc, x => x.bidAmount);
                console.log(balance);
                if (balance < ibid ) senderr(708, `Insufficient balance. Bid balance available is ${balance}`);
                else {
                  console.log("Balance availab;e");
                  var bidrec = new Auction({ uid: iuser,
                    pid: iplayer,
                    gid: 1,
                    bidAmount: ibid 
                  });
                  bidrec.save(function(err) {
                    if (err) senderr(DBFETCHERR, "Could not add new Auction record");
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

function senderr(errcode, msg)  { AuctionRes.status(errcode).send(msg); }
function sendok(msg)   { AuctionRes.send(msg); }
function setHeader() {
  AuctionRes.header("Access-Control-Allow-Origin", "*");
  AuctionRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
