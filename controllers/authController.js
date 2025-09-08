const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  // If already logged in, redirect based on user type
  if (req.session.isLoggedIn) {
    if (req.session.user && req.session.user.userType === 'guest') {
      return res.redirect("/homes");
    } else if (req.session.user && req.session.user.userType === 'host') {
      return res.redirect("/host/product-list");
    }
    return res.redirect("/");
  }
  
  // Clear any potential session issues
  req.session.errors = null;
  
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    errors: [],
    oldInput: {email: ""},
    user: {},
  });
};

exports.getSignUp = (req, res, next) => {
  // If already logged in, redirect based on user type
  if (req.session.isLoggedIn) {
    if (req.session.user && req.session.user.userType === 'guest') {
      return res.redirect("/homes");
    } else if (req.session.user && req.session.user.userType === 'host') {
      return res.redirect("/host/product-list");
    }
    return res.redirect("/");
  }
  
  // Clear any potential session issues
  req.session.errors = null;
  
  res.render("auth/signup", {
    pageTitle: "Signup", 
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {firstName: "", lastName: "", email: "", userType: ""},
    user: {},
  });
};

exports.postSignUp = [
  check("firstName")
  .trim()
  .isLength({min: 2})
  .withMessage("First Name should be atleast 2 characters long")
  .matches(/^[A-Za-z\s]+$/)
  .withMessage("First Name should contain only alphabets"),

  check("lastName")
  .matches(/^[A-Za-z\s]*$/)
  .withMessage("Last Name should contain only alphabets"),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email")
  .trim(),

  check("password")
  .isLength({min: 8})
  .withMessage("Password should be atleast 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password should contain atleast one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password should contain atleast one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password should contain atleast one number")
  .matches(/[!@&]/)
  .withMessage("Password should contain atleast one special character")
  .trim(),

  check("confirmPassword")
  .trim()
  .custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("Please select a user type")
  .isIn(['guest', 'host'])
  .withMessage("Invalid user type"),

  check("terms")
  .notEmpty()
  .withMessage("Please accept the terms and conditions")
  .custom((value, {req}) => {
    if (value !== "on") {
      throw new Error("Please accept the terms and conditions");
    }
    return true;
  }),
  
  (req, res, next) => {
    const {firstName, lastName, email, password, userType} = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Ensure we're rendering signup page even with errors
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map(err => err.msg),
        oldInput: {firstName, lastName, email, password, userType},
        user: {},
      });
    }

    bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({firstName, lastName, email, password: hashedPassword, userType});
      return user.save();
    })
    .then(() => {
      // Successful signup - redirect to login
      res.redirect("/login");
    }).catch(err => {
      // Error during signup - stay on signup page
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [err.message],
        oldInput: {firstName, lastName, email, userType},
        user: {},
      });
    });
  }
];

exports.postLogin = async (req, res, next) => {
  const {email, password} = req.body;
  
  // If no email or password provided, stay on login page
  if (!email || !password) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Please provide both email and password"],
      oldInput: {email: email || ""},
      user: {},
    });
  }
  
  const trimmedEmail = email.trim();
  
  try {
    const user = await User.findOne({email: trimmedEmail});
    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["User does not exist"],
        oldInput: {email},
        user: {},
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["Invalid password"],
        oldInput: {email},
        user: {},
      });
    }
    
    req.session.isLoggedIn = true;
    req.session.user = user;
    
    await req.session.save();
    
    // Redirect based on user type
    if (user.userType === 'guest') {
      return res.redirect("/homes");
    } else if (user.userType === 'host') {
      return res.redirect("/host/product-list");
    }
    return res.redirect("/");
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["An error occurred during login"],
      oldInput: {email},
      user: {},
    });
  }
};
exports.postValidateHostKey = (req, res, next) => {
  const { hostKey } = req.body;
  const validHostKey = process.env.HOST_KEY;
  res.json({
    valid: hostKey === validHostKey
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  })
}