const mongoose=require("mongoose");   
                                  
const userSchema=mongoose.Schema({
  firstName:{
    type:String,
    required:[true,'Last name is required']
  },
  lastName:{
    type:String,
  },
  email:{
    type:String,
    required:[true,'Email is required'],
    unique:true
  },
  password:{
    type:String,
    required:[true,'Password is required']
  },
  userType:{
    type:String,
    enum:['guest','host'],
    default:'guest'
  },
  carts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product'
  }],
  orders:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product'
  }]
})

module.exports=mongoose.model ("User",userSchema)



