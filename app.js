var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
//var users = require('./routes/users');
var settings = require('./settings');
var flash = require('connect-flash');

//
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var app = express();
app.use(session({
  resave: false,//重新保存：强制会话保存即使是未修改的。(默认值ture)
  saveUninitialized: true,//强制保存未初始化的会话到存储器
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {maxAge: 1000 * 60 * 60 * 24 *30},
  store: new MongoStore({url : 'mongodb://localhost/blog'})
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger('combined', {stream: accessLog}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + ']' + req.url + '/n';
  errorLog.write(meta + err.stack + '/n');
  next();
});
//app.use('/', index);
//app.use('/users', users);
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
