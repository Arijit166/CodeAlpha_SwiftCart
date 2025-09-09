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
      required: [true, 'Product is required for order']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required for order'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    paymentDetails: {
      paymentId: {
        type: String,
        required: [true, 'Payment ID is required']
      },
      orderId: {
        type: String,
        required: [true, 'Order ID is required']
      },
      orderDate: {
        type: Date,
        default: Date.now
      }
    }
  }]
});

module.exports = mongoose.model("User", userSchema);