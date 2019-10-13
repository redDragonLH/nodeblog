const DB = {
    artice:{},
    user:{},
    articeList:{},
}
class LocaDB {
    constructor() {
        
    }
    insert(name,data){
        if(name === 'artice'){
            this.articeInsert(data)
        }
    }
    articeInsert(data){
        DB.artice[data.title + data.user + data.time.day] = data
        DB.articeList[data.user][data.title]= {
                                                title : data.title,
                                                time : data.time,
                                                tag: data.tag,
                                            }
    }
    find(flag,info={}, callback){
        let data = []
        
        for (const ar of DB.artice) {
            if(ar[flag].includes(info.flagCen)){
                data.push(ar)
            }
        }
        callback(null,data)
    }
    getArtice(name, day, title, callback){
        DB.artice[title + name + day].pv++;
        callback(null, DB.artice[title + name + day])
    }
}
module.exports = new LocaDB();