const Home = require("../models/home");
const User = require("../models/user");


exports.getIndex = async (req, res, next) => {
  console.log("Session Value: ", req.session);

  try {
    const registeredHomes = await Home.find();
    let bookedHomeIds = [];

    if (req.session.user) {
      const user = await User.findById(req.session.user._id);
      if (user.bookings && user.bookings.length > 0) {
        bookedHomeIds = user.bookings.map(id => id.toString());
      }
    }

    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "homezy Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      bookedHomeIds: bookedHomeIds, // ✅ passed to EJS
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

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('bookings');
  res.render("store/bookings", {
    bookingHomes: user.bookings,
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postBookings = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);

    // Check if user already has this home booked
    if (user.bookings && user.bookings.some(b => b.toString() === homeId)) {
      return res.redirect("/bookings");
    }

    // Check if user already has a booking (only one booking allowed)
    if (user.bookings && user.bookings.length > 0) {
      const userWithBookings = await User.findById(userId).populate('bookings');
      return res.render("store/bookings", {
        bookingHomes: userWithBookings.bookings,
        pageTitle: "My Bookings",
        currentPage: "bookings",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
        errorMessage: "❗ You can book only one home at a time.",
      });
    }

    // Add the new booking
    if (!user.bookings) {
      user.bookings = [homeId];
    } else {
      user.bookings.push(homeId);
    }

    await user.save();
    res.redirect("/bookings");

  } catch (err) {
    console.error("Error in postBookings:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.postCancelBookings = async (req, res, next) => {
  const homeId = req.params.homeId;
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
    if (!user.bookings || !user.bookings.includes(homeId)) {
      return res.redirect("/bookings");
    }

    // Remove the booking
    user.bookings = user.bookings.filter(book => book.toString() !== homeId);
    await user.save();

    // Redirect to home page with success (as per original logic)
    res.redirect("/");

  } catch (err) {
    console.error("Error in postCancelBookings:", err);
    res.status(500).render("error/500", {
      pageTitle: "Error",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn, 
        user: req.session.user,
      });
    }
  });
};