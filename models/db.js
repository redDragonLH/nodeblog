var settings = require('../settings'),
    Mongodb = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
    
var mongodb = new Mongodb(settings.db, new Server(settings.host,  settings.port),{safe:true});
class Db {
    constructor(t) {
        console.log(t);
        
    };

    insert(name = 'posts' ,data = {} ,safe = true){
        // 打开数据库
        mongodb.open(function (err, db) {
            if (err) {
            return callback(err);
            }
            // 读取 posts 集合
            db.collection(name, function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            // 将文档插入 posts 集合
            collection.insert(data, {
                safe: safe
            }, function (err) {
                mongodb.close();
                if (err) {
                return callback(err); // 失败，返回 err
                }
                callback(null); // 返回err 为 null
            });
            });
        });
    };
        /**
     * name string
     * data object
     * position object
     */
    update(name = 'posts',data = {},position){
        // 打开数据库
        mongodb.open(function (err, db) {
            if (err) {
            return callback(err);
            }
            // 读取 posts 集合
            db.collection(name, function (err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            // 通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments数组里
            collection.update(data, {
                $push: position
            }, function (err) {
                mongodb.close();
                if (err) {
                return callback(err);
                }
                callback(null);
            });
            });
        });
    };
    find(name = 'posts',query = {}, sort = {time : -1}, callback){
        // 打开数据库
        mongodb.open(function (err, db) {
            if (err) {
            return callback(err);
            }
            // 读取 posts 集合
            db.collection(name, function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 根据query对象查询文章
            collection.find(query).sort(sort).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                return callback(err); //失败，返回 error
                }
                if(docs.length !==0 && docs[0].post){
                    // 解析 makdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                }
                callback(null,docs); // 成功，以数组形式返回查询结果
            });
            });
        });
    };
    findOne(){};
    remove(){};
}
module.exports = new Mongodb(settings.db, new Server(settings.host,  settings.port),{safe:true});