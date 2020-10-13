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

router.get(`/list/running`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  publishTournament({over: false});
});

router.get(`/list/over`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  publishTournament({over: true});
});

router.get(`/list/enabled`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  publishTournament({enabled: true});
});

router.get(`/list/disabled`, function(req, res, next) {
  TournamentRes = res;
  setHeader();
  publishTournament({enabled: false});
});


router.get('/add/:tournamentName/:tournamentDesc/:tournamentType', async function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName, tournamentDesc, tournamentType} = req.params;
    tournamentType = tournamentType.toUpperCase();
    if (!["TEST", "ODI", "T20"].includes(tournamentType)) {
      senderr(743, `Invalid tournament type ${tournamentType}. Has be be either TEST, ODI or T20`);
      return;
    }
    tournamentName = tournamentName.toUpperCase();
    var myrec = await Tournament.findOne({name: tournamentName});
    if (!myrec) {
        myrec = new Tournament();
        myrec.name = tournamentName;
        myrec.desc = tournamentDesc;
        myrec.type = tournamentType;
        myrec.over = false;
        myrec.save();
        sendok(`Successfully created tournament ${tournamentName}`);
    } else
        senderr(742,`Tournament ${tournamentName} already exists`);
});

router.use('/start/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    updateTournamentStatus(tournamentName, false);
});

router.use('/end/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    updateTournamentStatus(tournamentName, true);
});

router.use('/team/:tournamentName', function(req, res, next) {
    TournamentRes = res;
    setHeader();
    if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

    var {tournamentName} = req.params;
    tournamentName = tournamentName.toUpperCase();
    publish_teams({tournament: tournamentName});
});


async function updateTournamentStatus(tname, started)
{
    tname = tname.toUpperCase();
    var mytournament = await Tournament.findOne({name: tname});
    if (!mytournament) {
        senderr(741, `Invalid tournament name ${tname}`);
        return;
    }
    mytournament.over = started;
    mytournament.save();
    var retsts;
    if (!started)   retsts = `Tournament ${tname} is going on`;
    else            retsts = `Tournament ${tname} has ended`;
    sendok(retsts);
}

async function publishTournament(filter_tournament)
{
  var tlist = await Tournament.find(filter_tournament);
  // tlist = _.map(tlist, o => _.pick(o, ['name', 'desc', 'type', 'over']));
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