# 多用户登录博客系统  

###
与nginx配合需要转发监听node开启的端口
*参考*
server{  
  listen 80;  
  server_name blog.liuhecode.com;  
  index index.html index.htm index.php default.html default.htm default.php;

location / {  
    proxy_set_header X-Real-IP $remote_addr;  
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  
    proxy_set_header Host $http_host;  
    proxy_set_header X-NginX-Proxy true;  
    proxy_pass http://127.0.0.1:3000000/;  
    proxy_redirect off;  
  }
}
``` nodemon ./bin/www 开启服务  ``` 

``` mongod --dbpath c:\mongodata\blog  & mongod --logpath "C:\mongodata\blog\mongodb.log" --install  开启mongodb数据库 ```

##使用后台nodejs与数据mongodb写的系统  
  完全是全新的东西，没有学过，先按照书中的例子进行，再自己更改
### 17/1/28 记录  
 框架已经搭建完毕，可以进行基础的读写操作，更加复杂的操作后续添加
### 17/1/29
  添加Markdown 功能  
  添加上传文件功能
### 17/1/30
  添加用户页面和文章页面  
### 17/1/31
  添加 重新编辑 和 删除功能
### 17/2/1
  添加 分页功能
  添加 存档功能
### 17/2/2
  添加 标签功能  
  添加 PV统计 和 留言统计  
  添加 文章检索功能  
  添加 友情链接功能  
  添加 404页面  
  添加 用户头像功能  
      `注：用户头像功能是依靠一个网站运行，必须先注册网站用户，后期改成自定义图片存储在云上`  
  添加 转载功能和转载统计  
  添加 日志功能  



#### 主体正式写完，自定义样式与内容 在上班后再找机会进行  
[地址](http://blog.liuhecode.com/)

