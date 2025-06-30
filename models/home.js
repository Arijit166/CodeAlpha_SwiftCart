const {ObjectId}=require('mongodb')
const {getDB}=require('../utils/databaseUtil')
module.exports = class Home {
  constructor(name, price, location, rating, imageUrl, description, _id) {
    this.name = name;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.imageUrl = imageUrl;
    this.description = description;
    if(_id){
    this._id = _id;
  }}

  save() {
     const db=getDB();
     if(this._id){
      const updateFields={
        name: this.name, 
        price: this.price,
        location: this.location, 
        rating: this.rating, 
        imageUrl: this.imageUrl, 
        description: this.description
      }
       return db.collection("homes").updateOne({_id:new ObjectId(String(this._id))},{$set:updateFields})
     }else{
       return db.collection("homes").insertOne(this);
     }}

  static fetchAll() {
    const db=getDB();
    return db.collection("homes").find().toArray()
  }

  static findById(homeId) {
   const db=getDB();
    return db.collection("homes").find({_id:new ObjectId(String(homeId))}).next()
  }

  static deleteById(homeId) {
   const db=getDB();
    return db.collection("homes").deleteOne({_id:new ObjectId(String(homeId))})
  }
}