const mongoose = require("mongoose");  
                                 
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  userType: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },
  carts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orders: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    paymentDetails: {
      paymentId: String,
      orderId: String,
      orderDate: {
        type: Date,
        default: Date.now
      }
    }
  }]
});

module.exports = mongoose.model("User", userSchema);