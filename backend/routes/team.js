var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

/* GET users listing. */
router.use('/', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.url == '/') req.url = '/list';
  next('route');
});

router.get('/list', function(req, res, next) {
  mongoose.connect(mongoose_conn_string, { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    Team.find({},(err,resu)=>{
      if (err) { req.statusCode(400).send(err); return; }
      else {
        if(resu){console.log(resu)}
        res.send(resu);
      }
    });
  }); 
});

module.exports = router;
