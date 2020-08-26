//var express = require('express');
var router = express.Router();
//const mongoose = require("mongoose");
let TeamRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  TeamRes = res;
  if (!db_connection) { senderr(ERR_NODB); return; }

  if (req.url == '/') 
    publish_teams({});
  else
    next('route');
});


async function publish_teams(filter_teams)
{
  var tlist = await Team.find(filter_teams);
  tlist = _.map(tlist, o => _.pick(o, ['name', 'fullname']));
  sendok(tlist);
}

function sendok(usrmsg) { TeamRes.send(usrmsg); }
function senderr(errmsg) { TeamRes.status(400).send(errmsg); }
module.exports = router;
