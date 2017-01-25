var express = require('express');
var router = express.Router();

/* GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;*/
module.exports = function(app){
  app.get('./',function(req, res){
    res.render('index', { title: '主页' });
  });
  app.get('./reg',function(req, res){
    res.render('index', { title: '注册' });
  });
  app.post('./reg',function(req, res){
  });
  app.get('./login',function(req, res){
    res.render('index', { title: '登陆' });
  });
  app.post('./login',function(req, res){
    res.render('index', { title: '登陆' });
  });
  app.get('./post', function(req, res){
    res.render('index', { title: '发表' });
  });
  app.post('/post', function(req, res){
  });
  app.get('/logout',function(req, res){
  });
};
