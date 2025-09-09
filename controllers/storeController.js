const Product = require("../models/product");
const User = require("../models/user");


exports.getIndex = async (req, res, next) => {
  console.log("Session Value: ", req.session);

  try {
    const orderedProducts = await Product.find();

    res.render("store/index", {
      orderedProducts: orderedProducts,
      pageTitle: "SwiftCart Products",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });

  } catch (err) {
    console.error("Error loading index:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const orderedProducts = await Product.find();

    res.render("store/product-list", {
      orderedProducts: orderedProducts,
      pageTitle: "Product List",
      currentPage: "Products",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
      // Remove orderedProductIds since we're not restricting orders anymore
    });
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('orders.product');
    
    res.render("store/orders", {
      orderedProducts: user.orders || [],
      pageTitle: "My Orders",
      currentPage: "orders",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading orders:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.postOrders = async (req, res, next) => {
  const productId = req.body.id;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);

    // Always add new order (remove restriction checks)
    if (!user.orders) {
      user.orders = [];
    }

    // Add new order with default quantity of 1
    user.orders.push({
      product: productId,
      quantity: 1,
      paymentDetails: {
        paymentId: `direct_${Date.now()}`,
        orderId: `order_${Date.now()}`,
        orderDate: new Date()
      }
    });

    await user.save();
    res.redirect("/orders");

  } catch (err) {
    console.error("Error in postOrders:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.postCancelOrders = async (req, res, next) => {
  const orderId = req.params.productId; // This is actually the order._id
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render("error/404", {
        pageTitle: "User Not Found",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }

    // Remove the specific order by its _id
    user.orders = user.orders.filter(order => order._id.toString() !== orderId);
    await user.save();

    res.redirect("/orders");

  } catch (err) {
    console.error("Error in postCancelOrders:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};
exports.getOrderList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('carts');
  res.render("store/orders", {
    cartProducts: user.carts,
    pageTitle: "My orders",
    currentPage: "orders",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};
exports.getCartList = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('carts');
    res.render("store/cart-list", {
      cartProducts: user.carts,
      pageTitle: "My Cart",
      currentPage: "carts",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading cart:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};
exports.postAddToCart = async (req, res, next) => {
  const productId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.carts.includes(productId)) {
    user.carts.push(productId);
    await user.save();
  }
  res.redirect("/cart-list");
};

exports.postRemoveFromCart = async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.carts.includes(productId)) {
    user.carts = user.carts.filter(fav => fav != productId);
    await user.save();
  }
  res.redirect("/cart-list");
};

exports.getProductDetails = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId).then((product) => {
    if (!product) {
      console.log("Product not found");
      res.redirect("/product-list");
    } else {
      res.render("store/product-detail", {
        product: product,
        pageTitle: "Product Detail",
        currentPage: "Products",
        isLoggedIn: req.isLoggedIn, 
        user: req.session.user,
      });
    }
  });
};

// Get order form with quantity selection
exports.getOrderForm = async (req, res, next) => {
  const productId = req.params.productId;
  
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.redirect("/product-list");
    }

    res.render("store/order-form", {
      product: product,
      pageTitle: "Order Product",
      currentPage: "order",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading order form:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

// Create Razorpay order
exports.createRazorpayOrder = async (req, res, next) => {
  const { productId, quantity } = req.body;
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const amount = product.price * quantity * 100; // Razorpay expects amount in paise
    
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
      notes: {
        productId: productId,
        quantity: quantity,
        userId: req.session.user._id
      }
    };

    const order = await req.app.locals.razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      product: {
        name: product.name,
        price: product.price,
        image: product.image
      },
      user: {
        name: `${req.session.user.firstName} ${req.session.user.lastName || ''}`,
        email: req.session.user.email
      },
      quantity: quantity
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.verifyPayment = async (req, res, next) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    productId,
    quantity 
  } = req.body;

  try {
    const crypto = require('crypto');
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      const userId = req.session.user._id;
      const user = await User.findById(userId);

      // Check if orders array exists, if not create it
      if (!user.orders) {
        user.orders = [];
      }

      // Always add new order (allow multiple orders of same product)
      user.orders.push({
        product: productId,
        quantity: parseInt(quantity),
        paymentDetails: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          orderDate: new Date()
        }
      });

      await user.save();

      res.json({ 
        success: true, 
        message: "Payment verified and order placed successfully" 
      });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};