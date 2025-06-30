const mongo=require("mongodb");
const MongoClient=mongo.MongoClient;
const url="mongodb+srv://root:arijit@completecoding.4chqhqg.mongodb.net/?retryWrites=true&w=majority&appName=CompleteCoding";
let _db;
const mongoConnect=(callback)=>{
    MongoClient.connect(url)
    .then((client)=>{
        callback();
        _db=client.db('homezy')
    }).catch((err)=>{
        console.log("Error while connecting to Mongodb",err)
    })
}
const getDB=()=>{                //for calling database
    if (!_db){
        throw new Error ("Mongo not connected")
    }
    return _db
}
exports.mongoConnect=mongoConnect
exports.getDB=getDB