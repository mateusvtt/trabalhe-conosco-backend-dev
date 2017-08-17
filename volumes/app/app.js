var express = require('express');
var app = express();
var db = require('./db');

//logger
var logger = require('morgan');
app.use(logger('dev'));

//setando favicon
var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/static/images/picpayicon.png'));

//adicionando time-stamp nas mensagens de log
require('console-stamp')(console, '[HH:MM:ss.l]');

//setando diretorios estaticos
app.use('/img',express.static(__dirname + '/static/images'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/static/js')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect bootstrap JS
app.use('/css',express.static(__dirname + '/static/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/fonts')); // redirect bootstrap fonts

// set the view engine to ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//controllers
var UserController = require('./controllers/userController');
app.use('/users', UserController);

app.get('/update', function (req, res) {
  var User = require('./models/user');
  var lockFile = require('lockfile')
  lockFile.lock('some-file.lock', function (er) {
    User.setDatabase(function(callback){
      lockFile.unlock('some-file.lock', function (er) {});
    });
  });
  res.render('loadingDataBase');
});

app.get('/', function (req, res) {
   res.render('index');
});

module.exports = app;
