//var express = require('express');
var router = express.Router();
let PrizeRes;

/* GET users listing. */
router.use('/', function(req, res, next) {
  PrizeRes = res;
  setHeader();
  if (!db_connection) { senderr(DBERROR, ERR_NODB); return; }
  next('route');
});


async function getPrizeTable(count, amount) {
  let myPrize = await Prize.findOne({prizeCount: count})
  // we will keep 5% of amount
  // rest (i.e. 95%) will be distributed among users
  let totPrize = Math.floor(amount*0.95)
  let allotPrize = 0;
  let prizeTable=[]
  for(i=1; i<count; ++i) {
    let thisPrize = Math.floor(totPrize*myPrize["prize"+i.toString()]/100);
    prizeTable.push({rank: i, prize: thisPrize})
    allotPrize += thisPrize;
  }
  prizeTable.push({rank: count, prize: totPrize-allotPrize});
  return prizeTable;
}


router.get('/all/:amount', async function (req, res, next) {
  PrizeRes = res;
  setHeader();

  var { amount } = req.params;
 
  let allPrize=[];
  for(i=1; i<=5; ++i) {
    let mytab = await getPrizeTable(i, amount);
    allPrize.push(mytab);
  }
  sendok(allPrize);
}); 



router.get('/addprize', async function (req, res, next) {
  PrizeRes = res;
  setHeader();

  let myPrize = new Prize({
    prizeCount: 1,
    prize1: 100,
    prize2: 0,
    prize3: 0,
    prize4: 0,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 2,
    prize1: 60,
    prize2: 40,
    prize3: 0,
    prize4: 0,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 3,
    prize1: 50,
    prize2: 30,
    prize3: 20,
    prize4: 0,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 4,
    prize1: 40,
    prize2: 30,
    prize3: 20,
    prize4: 10,
    prize5: 0,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  myPrize = new Prize({
    prizeCount: 5,
    prize1: 35,
    prize2: 25,
    prize3: 20,
    prize4: 13,
    prize5: 7,
    prize6: 0,
    prize7: 0,
    prize8: 0,
    prize9: 0,
    prize10: 0,
  })
  myPrize.save();

  sendok("ok");
}); 


function sendok(usrmsg) { PrizeRes.send(usrmsg); }
function senderr(errcode, errmsg) { PrizeRes.status(errcode).send(errmsg); }
function setHeader() {
  PrizeRes.header("Access-Control-Allow-Origin", "*");
  PrizeRes.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}
module.exports = router;
