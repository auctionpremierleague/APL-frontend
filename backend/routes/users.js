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

router.get('/:userName/:password', function(req, res, next) {
const {userName,password} =req.params;
console.log(userName,password);
mongoose.connect("mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020", { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    console.log("MongoDB database connection established successfully");
    const UserSchema = mongoose.Schema({
    userName:String,
    password:String

  });
  let User;

  // compile schema to model
  try{ User = mongoose.model("users", UserSchema);}
  catch(err){
    User=mongoose.model("users")
  }
  User.findOne({userName,password},(err,resu)=>{
    if(resu){res.send("login sucess")}else{ res.status("400").send("fail")}
  });

  })
  
});


router.post('/', function(req, res, next) {
 console.log(req.body)
  const{userName,password}=req.body
  console.log("User name = "+userName+", password is "+password);
mongoose.connect("mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020", { useNewUrlParser: true, useUnifiedTopology: true }, function() {
    console.log("MongoDB database connection established successfully");
    const UserSchema = mongoose.Schema({
    userName:String,
    password:String

  });
  let User;

  // compile schema to model
  try{ User = mongoose.model("users", UserSchema);}
  catch(err){
    User=mongoose.model("users")
  }
  User.insertMany([{userName,password}])
    res.send("User name = "+userName+", password is "+password);
  })
 
});


module.exports = router;
