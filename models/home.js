const db=require("../utils/databaseUtil")
module.exports = class Home {
  constructor(name, price, location, rating, imageUrl, description, id) {
    this.name = name;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.imageUrl = imageUrl;
    this.description = description;
    this.id = id;
  }

  save() {
    if(this.id){
      return db.execute ('UPDATE homes SET name=?, price=?, location=?, rating=?, imageUrl=?, description=? WHERE id=?',[this.name, this.price, this.location, this.rating, this.imageUrl, this.description, this.id])
    }else{
      return db.execute ('INSERT INTO homes (name, price, location, rating, imageUrl, description) VALUES (?,?,?,?,?,?)',[this.name, this.price, this.location, this.rating, this.imageUrl, this.description, this.id])
    }}

  static fetchAll() {
    return db.execute ("SELECT * FROM homes")
  }

  static findById(homeId) {
    return db.execute ("SELECT * FROM homes WHERE id=?",[homeId]);
  }

  static deleteById(homeId) {
    return db.execute ("DELETE FROM homes WHERE id=?",[homeId])
  }
}