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
    let orderedProductIds = [];

    // Check if user is logged in and get their orders
    if (req.session.user) {
      const user = await User.findById(req.session.user._id);
      if (user.orders && user.orders.length > 0) {
        orderedProductIds = user.orders.map(id => id.toString());
      }
    }

    res.render("store/product-list", {
      orderedProducts: orderedProducts,
      pageTitle: "Product List",
      currentPage: "Products",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
      orderedProductIds: orderedProductIds, // ✅ Added for order status tracking
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
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('orders');
  res.render("store/orders", {
    orderedProducts: user.orders,
    pageTitle: "My Orders",
    currentPage: "orders",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postOrders = async (req, res, next) => {
  const productId = req.body.id;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);

    if (user.orders && user.orders.some(b => b.toString() === productId)) {
      return res.redirect("/orders");
    }

    if (user.orders && user.orders.length > 0) {
      const userWithorders = await User.findById(userId).populate('orders');
      return res.render("store/orders", {
        orderedProducts: userWithorders.orders,
        pageTitle: "My orders",
        currentPage: "orders",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }

    // Add the new booking
    if (!user.orders) {
      user.orders = [productId];
    } else {
      user.orders.push(productId);
    }

    await user.save();
    res.redirect("/orders");

  } catch (err) {
    console.error("Error in postorders:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.postCancelOrders = async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.session.user._id;

  try {
    // Find the user and remove the booking
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render("error/404", {
        pageTitle: "User Not Found",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }

    // Check if the booking exists
    if (!user.orders || !user.orders.includes(productId)) {
      return res.redirect("/orders");
    }

    // Remove the booking
    user.orders = user.orders.filter(order => order.toString() !== productId);
    await user.save();

    // Redirect to home page with success (as per original logic)
    res.redirect("/product-list");

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