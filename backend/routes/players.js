var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020", { useNewUrlParser: true, useUnifiedTopology: true } );

// const connection = mongoose.connection;


/* GET users listing. */
router.use('/', function(req, res, next) {
 
console.log("1");
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});

router.get('/', function(req, res, next) {

mongoose.connect("mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020", { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    console.log("MongoDB database connection established successfully");
    const PlayerSchema = mongoose.Schema({
        name: String,
        fullName: String,
        pid: Number

    });

    // compile schema to model
   
  let Player;

  // compile schema to model
  try{  Player = mongoose.model("Iplplayers", PlayerSchema);}
  catch(err){
    Player = mongoose.model("Iplplayers");
  }
  Player.find({},(err,resu)=>{
    if(resu){console.log(resu)}
    res.send(resu);
  });

  })
  
});





module.exports = router;
