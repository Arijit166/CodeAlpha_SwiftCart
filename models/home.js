const mongoose=require("mongoose");                                   
const homeSchema=mongoose.Schema({
  name: {type: String, required: true},
  price: {type: String, required: true},
  location: {type: String, required: true},
  rating: {type: String, required: true},
  imageUrl: String,
  description: String
}) 

// homeSchema.pre('findOneAndDelete',async function(next){
//   const homeId=this.getQuery()["_id"];
//   await Favourite.deleteMany({homeId:homeId});
//   next();
// })         

module.exports=mongoose.model ("Home",homeSchema)



