//var express = require('express');
var router = express.Router();
//const mongoose = require("mongoose");
let TeamRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  TeamRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }

  if (req.url == '/') 
    publish_teams({});
  else
    next('route');
});


async function publish_teams(filter_teams)
{
  var tlist = await Team.find(filter_teams);
  tlist = _.map(tlist, o => _.pick(o, ['name', 'fullname', 'tournament']));
  sendok(tlist);
}

function sendok(usrmsg) { TeamRes.send(usrmsg); }
function senderr(errcode, errmsg) { TeamRes.status(errcode).send(errmsg); }
function setHeader() {
  TeamRes.header("Access-Control-Allow-Origin", "*");
  TeamRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
