const mongoose=require("mongoose");                                   
const productSchema=mongoose.Schema({
  name: {type: String, required: true},
  price: {type: String, required: true},
  rating: {type: String, required: true},
  image: String,
  description: String
}) 

module.exports=mongoose.model ("Product",productSchema)



