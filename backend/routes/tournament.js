var router = express.Router();
let TournamentRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  TournamentRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == '/') 
    publishTournament({});
  else
    next('route');
});

router.use('/add/:tournamentName', async function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    tournamentName = tournamentName.toUpperCase();
    var myrec = await Tournament.findOne({name: tournamentName});
    if (!myrec) {
        myrec = new Tournament();
        myrec.name = tournamentName;
        myrec.desc = tournamentName;
        myrec.enabled = false;
        myrec.save();
        sendok(`New tournament ${tournamentName} created`);
    } else
        senderr(742,`Tournamet ${tournamentName} already created`);
    //updateTournamentStatus(tournamentName, true);
});

router.use('/start/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    updateTournamentStatus(tournamentName, true);
});

router.use('/end/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    updateTournamentStatus(tournamentName, false);
});

router.use('/team/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    tournamentName = tournamentName.toUpperCase();
    publish_teams({tournament: tournamentName});
});


async function updateTournamentStatus(tname, enableMe)
{
    tname = tname.toUpperCase();
    var mytournament = await Tournament.findOne({name: tname});
    if (!mytournament) {
        senderr(741, `Invalid tournament name ${tname}`);
        return;
    }
    mytournament.enabled = enableMe;
    mytournament.save();
    var retsts;
    if (enableMe)   retsts = `Tournement ${tname} is Enabled`;
    else            retsts = `Tournement ${tname} is Disabled`;
    sendok(retsts);
}

async function publishTournament(filter_tournament)
{
  var tlist = await Tournament.find(filter_tournament);
  tlist = _.map(tlist, o => _.pick(o, ['name', 'desc', 'enabled']));
  sendok(tlist);
}


async function publish_teams(filter_teams)
{
  var tlist = await Team.find(filter_teams);
  tlist = _.map(tlist, o => _.pick(o, ['name', 'fullname', 'tournament']));
  sendok(tlist);
}

function sendok(usrmsg) { TournamentRes.send(usrmsg); }
function senderr(errcode, errmsg) { TournamentRes.status(errcode).send(errmsg); }
function setHeader() {
  TournamentRes.header("Access-Control-Allow-Origin", "*");
  TournamentRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
