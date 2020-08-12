var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require('cors');
var app = express(),
PORT = 4000;


// Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var auctionRouter = require('./routes/auction');
var playersRouter = require('./routes/player');
var groupRouter = require('./routes/group');
var teamRouter = require('./routes/team');
var playerStatRouter = require('./routes/playerstat');
var matchRouter = require('./routes/match')


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/player',playersRouter);
app.use('/auction', auctionRouter);
app.use('/group', groupRouter);
app.use('/team', teamRouter);
app.use('/playerstat', playerStatRouter);
app.use('/match', matchRouter);

// ---- start of globals
// connection string for database
mongoose_conn_string = "mongodb+srv://akshama:akshama@cluster0-urc6p.mongodb.net/IPL2020";

//Schema
UserSchema = mongoose.Schema({
    uid:Number,
    userName:String,
    password:String,
    status:Boolean
  });
GroupSchema = mongoose.Schema({
    gid:Number,
    name:String,
    owner:String,
    maxBidAmount:String
});
PlayerSchema = mongoose.Schema({
    pid:Number,
    name:String,
    fullName:String,
    Team:String,
    role:String,
    bowlingStyle:String,
    battingStyle:String
  }); 
AuctionSchema = mongoose.Schema({
    gid:Number,
    uid:Number,
    pid:Number,
    bidAmount:Number
  });
GroupMemberSchema = mongoose.Schema({
    gid:Number,
    uid:Number,
    balanceAmount:Number        // balance available to be used for bid
});
TeamSchema = mongoose.Schema({
    name:String,
    fullanme:String
})
MatchSchema = mongoose.Schema({
    mid:Number,
    description:String,
    team1:String,
    team2:String,
    team1Desciption:String,
    team2Desciption:String,
    matchTime:Date,
    weekDay:String
});
PlayerStatSchema = mongoose.Schema({
    pid:Number,
    mid:Number,
    // batting stats
    sixCount:Number,
    fourCount:Number,
    fiftyCount:Number,
    hundredCount:Number,
    runCount:Number,
    // bowling stats
    threewktCount:Number,
    fivewktCount:Number,
    wicketCount:Number,
    manOfTheMatch:Number
});

// models
User = mongoose.model("users", UserSchema);
Player = mongoose.model("iplplayers", PlayerSchema);
Auction = mongoose.model("iplauction", AuctionSchema);
Group = mongoose.model("iplgroup", GroupSchema);
GroupMember = mongoose.model("groupmembers", GroupMemberSchema);
Team = mongoose.model("iplteams", TeamSchema);
Match = mongoose.model("iplmatches", MatchSchema);
PlayerStat = mongoose.model("iplplayerstats", PlayerStatSchema);

// ----------------  end of globals

app.listen(PORT, ()=> {
    console.log("Server is running on Port: " + PORT);
});

// module.exports = app;
