var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var fs = require('fs');
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
    // 判断是否第一页，并把请求的页数转换成 number 类型
    var page = req.query.p ? parseInt(req.query.p) : 1;
    // 查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if(err) {
        posts = [];
      }
      res.render('index', {
        title: '主页',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });

    // 暂时废弃
    // Post.getAll(null, function (err, posts) {
    //   if (err) {
    //     posts = [];
    //   }
    //   res.render('index', {
    //     title: '主页',
    //     user: req.session.user,
    //     posts: posts,
    //     success: req.flash('success').toString(),
    //     error: req.flash('error').toString()
    //    });
    // });
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
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
     });
  });
  app.post('/post',checkLogin);
  app.post('/post', function(req, res){
    var currentUser = req.session.user,
        tags = [req.body.tag1,req.body.tag2,req.body.tag3],
        post = new Post(currentUser.name, currentUser.head, req.body.title, req.body.post, tags);
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

  app.get('/archive', function (req, res) {
    Post.getArchive(function (err,posts) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('archive',{
        title: '存档',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags', function (req, res) {
    Post.getTags(function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tags', {
        title: '标签',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags/:tag', function (req, res) {
    Post.getTag(req.params.tag, function (err, posts) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tag', {
        title: 'TAG: ' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  // 友链
  app.get('/links', function (req, res) {
    res.render('links', {
      title: '友情链接',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  // 搜索
  app.get('/search', function (req, res) {
    Post.search(req.query.keyword, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('search', {
        title: "SEARCH: " + req.query.keyword,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/u/:name', function (req, res) {
    var page = req.query.p ? parseInt(req.query.p) :1 ;
    User.get(req.params.name, function (err, user) {
      if(!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/'); //跳转主页面
      }
      // 查询并返回该用户第 page 页的 10 篇文章
      Post.getTen(user.name, page, function (err, posts, total) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + posts.length) == total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });

    // **---- 可能暂时废弃 （预计不需要重新启用）---**
    // // 检查用户是否存在
    // User.get(req.params.name, function (err, user) {
    //   if(!user) {
    //     req.flash('error', '用户不存在');
    //     return res.redirect('/'); //跳转主页面
    //   }
    //   // 查询并返回该用户的所有文章
    //   Post.getAll(user.name, function (err, posts) {
    //     if(err) {
    //       req.flash('error', err);
    //       return res.redirect('/');
    //     }
    //     res.render('user', {
    //       title: user.name,
    //       posts: posts,
    //       user: req.session.user,
    //       success: req.flash('success').toString(),
    //       error: req.flash('error').toString()
    //     });
    //   });
    // });
  });

  app.get('/u/:name/:day/:title', function (req, res) {
    Post.getOne(req.params.name, req.params.day, req.params.title,function (err,post) {
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: req.params.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/u/:name/:day/:title',function (req, res) {
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/" + email_MD5 + "?s=48";
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "" + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
    var comment = {
      name: req.body.name,
      head: head,
      email: req.body.email,
      website: req.body.website,
      time: time,
      content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function(err) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '留言成功');
      res.redirect('back');
    });
  });

  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user:req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' +req.params.title);
      if(err) {
        req.flash('error', err);
        return res.redirect(url); // 出错 返回文章页
      }
      req.flash('success', '修改成功');
      res.redirect(url); //成功，返回文章页
    });
  });

  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name,req.params.day, req.params.title, function (err) {
      if(err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功');
      res.redirect('/');
    });
  });

  //转载
  app.get('/reprint/:name/:day/:title', checkLogin);
  app.get('/reprint/:name/:day/:title', function (req, res) {
    Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
      if(err) {
        req.flash('error', err);
        return res.redirect(back);
      }
      var currentUser = req.session.user,
          reprint_from = {name: post.name, day: post.time, title: post.title},
          reprint_to = {name: currentUser.name, head: currentUser.head};

      Post.reprint(reprint_from,reprint_to, function (err, post) {
        if(err) {
          req.flash('error', err);
          return res.redirect('back');
        }
        req.flash('success', '转载成功');
        var url = encodeURI('/u/' + post.name + '/' + post.time.day + '/' + post.title);

        // 跳转到转载后的页面
        res.redirect(url);
      });
    });
  });
  app.post('hooks',function functionName(req, res) {
    fs.writeFile('hook.text',  req.body ,(err)=>{
      if(err){
          console.log(err);
          console.log('写入失败');
      }
      console.log('写入成功----------------------');
      
  })
  })

  // 404
  app.use(function (req, res) {
    res.render('404');
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
