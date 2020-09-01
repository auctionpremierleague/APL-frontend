var router = express.Router();
var GroupRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  GroupRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB);  return; };

  if (req.url == '/')
    publish_groups({});
  else
    next('route');
});

router.get('/close/:groupid/:ownerid', function(req, res, next) {
  GroupRes = res;
  setHeader();

  var {groupid,ownerid}=req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  if (ownerid != "9") { senderr(624, `User ${ownerid} is not owner of Group 1`); return; }

  IPLGroup.findOne({gid: 1}, (err, gdoc) =>  {
    if (gdoc === undefined) senderr(DBFETCHERR, "Could not fetch Group record");
    else {
      console.log(gdoc);
      gdoc.tournamentOver = true;
      gdoc.save();
      sendok(true);
    }
  });
});

router.get('/add/:groupid/:ownerid/:userid', function(req, res, next) {
  GroupRes = res;
  setHeader();

  var {groupid,ownerid,userid}=req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr(621, "Invalid Group"); return; }
  if (ownerid != "9") { senderr(624, `User ${ownerid} is not owner of Group 1`); return; }

  igroup = parseInt(groupid);
  if (isNaN(igroup)) { senderr(621, "Invalid group"); return; }
  iowner = parseInt(ownerid);
  if (isNaN(iowner)) { senderr(622, "Invalid owner"); return; }
  iuser = parseInt(userid);
  if (isNaN(iuser)) { senderr(623, "Invalid user"); return; }

  User.findOne({uid:iuser}, (err, udoc) => {
    if (err)
      senderr(DBFETCHERR, err);
    else if (!udoc)
      senderr(623, "Invalid user");
    else { 
      GroupMember.findOne({gid:1, uid: iuser}, (err, gmdoc) =>  {
        if (err)
          senderr(DBFETCHERR, err);
        else if (gmdoc)
          senderr(624, "User already added to group 1");
        else {                
          //console.log("Valid USer");              
          //  confirmed that Group 1 exists
          //  confirmed that owner of the group is correct
          //  confirmed that new user is correct                        
          //var myamount = 1000;
          var gmrec = new GroupMember({ 
            gid: 1,
            uid: iuser,
            balanceAmount: GROUP1_MAXBALANCE
          });
          gmrec.save(function(err) {
            if (err) {senderr(DBFETCHERR, "Unable to added user to Group 1"); }
            else { sendok(`Added user ${iuser} to Group 1`); }
          });
        }
      });
    }
  });
}); // end of get

router.get('/owner', function (req, res, next) {
  GroupRes = res;
  setHeader();

  owneradmin();
});

router.get('/admin', function(req, res, next) {
  GroupRes = res;
  setHeader();

  owneradmin();
});


// who is the owner of the group. Returns user record of the owner
function owneradmin()
{
  let igroup = 1;   // currently only group 1 supported
  IPLGroup.findOne({gid: 1},(err, grprec) => {
    if (!grprec) { senderr(621, "Invalid group"); return; }
    //console.log(grprec);
    User.findOne({uid: grprec.owner}, (err, userrec) => {
      if (!userrec) { senderr(DBFETCHERR, `Could fetch record of user ${grprec.uid}`); return; }
      sendok(userrec);
    });
  });
};

router.get('/test', function(req, res, next) {
  GroupRes = res;
  setHeader();

  update_tournament_max(1);
});

// router.get('/members/:groupid', function(req, res, next) {
//   GroupRes = res;
//   setHeader();

//   var {groupid}=req.params;
//   sendok("Member details under development");
// });

async function update_tournament_max(groupno)
{
  // first find maximum of run scored by batsman and wickets taken by bowler 
  // get list of players beloging to group
  //var auctionList = await Auction.find({gid: groupno});
  //var allplayers = _.map(auctionList, 'pid');
  var playersList = await Player.find({});
  var allplayers = _.map(playersList, 'pid');
  //ar maxRuns, maxWickets, maxRunsPlayer, maxWicketsPlayer;
  var statList = await Stat.find({pid: {$in: allplayers}});
  var maxStat = [];
  allplayers.forEach(mypid => {
    var playerStat = _.filter(statList, x => x.pid == mypid);
    if (playerStat.length === 0) return;
    var myruns = _.sumBy(playerStat, 'run');
    var mywkt = _.sumBy(playerStat, 'wicket');
    if ((myruns + mywkt) === 0) return;
    maxStat.push({pid: mypid, run: myruns, wicket: mywkt});
  });
  console.log(maxStat);
  // we now have players total of run an wickets.  Get max run and wicket
  var maxRunRec = _.maxBy(maxStat, o => o.run);
  var maxWicketRec = _.maxBy(maxStat, o => o.wicket);
  // get all records with max runs and max wickets
  var allMaxRunRec = _.filter(maxStat, x => x.run == maxRunRec.run);
  var allMaxWicketRec = _.filter(maxStat, x => x.wicket == maxWicketRec.wicket);
  sendok(allMaxWicketRec);
}

function publish_groups(filter_groups)
{
  IPLGroup.find(filter_groups,(err,glist) =>{
    if(glist)
      sendok(glist);
    else
      senderr(DBFETCHERR, "Unable to fetch Groups from database");
  });
}

function senderr(errcode, msg)  { GroupRes.status(errcode).send(msg); }
function sendok(msg)   { GroupRes.send(msg); }
function setHeader() {
  GroupRes.header("Access-Control-Allow-Origin", "*");
  GroupRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

}
module.exports = router;
