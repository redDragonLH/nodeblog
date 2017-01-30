var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
// 上传文件
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

var upload = multer({ storage: storage });
/* GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;*/
module.exports = function(app){
  app.get('/',function(req, res){
    Post.get(null, function (err, posts) {
      if (err) {
        posts = [];
      }
      res.render('index', {
        title: '主页',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
       });
    });
  });
  app.get('/reg',checkNotLogin);
  app.get('/reg',function(req, res){
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
     });
  });
  app.post('/reg',checkNotLogin);
  app.post('/reg',function(req, res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验两次输入是否一致
    if(password != password_re){
      req.flash('error','两次输入不一致');
      return res.redirect('/reg'); //返回注册页
    }
    // 生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name:req.body.name,
        password: password,
        email: req.body.email
    });
    // 检查用户名是否存在
    User.get(newUser.name,function(err,user){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      if(user){
        req.flash('error','用户已存在');
        return res.redirect('/reg'); //返回注册页
      }
      // 如果不存在则新增用户
      newUser.save(function(err,user){
        if(err){
          req.flash('error',err);
          return res.redirect('/reg'); //注册失败返回注册页
        }
        req.session.user = user; //用户信息存入 session
        req.flash('success','注册成功!');
        res.redirect('/');
      });
    });
  });
  app.get('/login',checkNotLogin);
  app.get('/login',function(req, res){
    res.render('login', {
      title: '登陆',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
     });
  });
  app.post('/login',checkNotLogin);
  app.post('/login',function(req, res){
    // 生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name,function(err,user){
      if(!user) {
        req.flash('error',"用户不存在");
        return res.redirect('/login'); //用户不存在则跳转到登陆页
      }
      // 检查密码时候一致
      if(user.password != password){
        req.flash('error',"密码错误");
        return res.redirect('/login'); //密码错误则跳转到登陆页
      }
      // 用户名密码匹配后，将用户信息存入session
      req.session.user = user;
      req.flash('success',"登陆成功");
      return res.redirect('/'); //用户不存在则跳转到登陆页
    });
  });
  app.get('/post',checkLogin);
  app.get('/post', function(req, res){
    res.render('post', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
     });
  });
  app.post('/post',checkLogin);
  app.post('/post', function(req, res){
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err){
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', "发布成功!");
      res.redirect('/'); // 发表成功，跳转到主页
    });
  });
  app.get('/logout',checkLogin);
  app.get('/logout',function(req, res){
    req.session.user = null;
    req.flash('success',"登出成功");
    return res.redirect('/'); //用户不存在则跳转到登陆页
  });
  app.get('/upload', checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/upload', upload.fields([
    {name: 'file1'},
    {name: 'file2'},
    {name: 'file3'},
    {name: 'file4'},
    {name: 'file5'}
]), function(req, res, next){
    var text,host;
    for(var i in req.files){
        text = req.files[i][0].destination + '/' + req.files[i][0].filename;
        host = req.host+':3000/';
        console.log(req.files[i]);
    }
    req.flash('success', '文件上传成功!'+ '文件链接: ' + host + text);
    res.redirect('/upload');
});
  function checkLogin(req, res, next) {
    if( !req.session.user) {
      req.flash('error', '未登录');
      res.redirect('/login');
    }
    next();
  }
  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录');
      res.redirect('back');
    }
    next();
  }
};
