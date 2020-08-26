var router = express.Router();
var GroupRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  GroupRes = res;
  if (!db_connection) { senderr(ERR_NODB);  return; };

  if (req.url == '/')
    publish_groups({});
  else
    next('route');
});

 
router.get('/add/:groupid/:ownerid/:userid', function(req, res, next) {
  GroupRes = res;

  var {groupid,ownerid,userid}=req.params;
  // groupAction = groupAction.toLowerCase();
  if (groupid != "1") { senderr("Invalid Group"); return; }
  if (ownerid != "9") { senderr(`User ${ownerid} is not owner of Group 1`); return; }

  igroup = parseInt(groupid);
  if (isNaN(igroup)) { senderr("Invalid group"); return; }
  iowner = parseInt(ownerid);
  if (isNaN(iowner)) { senderr("Invalid owner"); return; }
  iuser = parseInt(userid);
  if (isNaN(iuser)) { senderr("Invalid user"); return; }

  User.findOne({uid:iuser}, (err, udoc) => {
    if (err)
      senderr(err);
    else if (!udoc)
      senderr("Invalid user");
    else { 
      GroupMember.findOne({gid:1, uid: iuser}, (err, gmdoc) =>  {
        if (err)
          senderr(err);
        else if (gmdoc)
          senderr("User already added to group 1");
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
            if (err) {senderr("Unable to added user to Group 1"); }
            else { sendok(`Added user ${iuser} to Group 1`); }
          });
        }
      });
    }
  });
}); // end of get

router.get('/owner', function (req, res, next) {
  GroupRes = res;
  owneradmin();
});

router.get('/admin', function(req, res, next) {
  GroupRes = res;
  owneradmin();
});


// who is the owner of the group. Returns user record of the owner
function owneradmin()
{
  let igroup = 1;   // currently only group 1 supported
  IPLGroup.findOne({gid: 1},(err, grprec) => {
    if (!grprec) { senderr("Invalid group"); return; }
    //console.log(grprec);
    User.findOne({uid: grprec.owner}, (err, userrec) => {
      if (!userrec) { senderr(`Could fetch record of user ${grprec.uid}`); return; }
      sendok(userrec);
    });
  });
};


router.get('/members/:groupid', function(req, res, next) {
  GroupRes = res;
  var {groupid}=req.params;
  sendok("Member details under development");
});

function publish_groups(filter_groups)
{
  IPLGroup.find(filter_groups,(err,glist) =>{
    if(glist)
      sendok(glist);
    else
      senderr("Unable to fetch Groups from database");
  });
}

function senderr(msg)  { GroupRes.status(400).send(msg); }
function sendok(msg)   { GroupRes.send(msg); }
module.exports = router;
