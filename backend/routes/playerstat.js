var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
const { enabled } = require('debug');

/* GET all users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.send("Player Statistics controller under development");
  next();
});

function senderr(res, msg)  { res.status(400).send(msg); }
function sendok(res, msg)   { res.send(msg); }
module.exports = router;
