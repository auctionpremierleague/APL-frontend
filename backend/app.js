var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var playersRouter = require('./routes/players');
var cors = require('cors');
var app = express(),
PORT = 4000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/players',playersRouter);

app.listen(PORT, ()=> {
    console.log("Server is running on Port: " + PORT);
});

// module.exports = app;
