require('dotenv').config();
// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_PATH = process.env.MONGODB_URI;
const { default: mongoose } = require('mongoose');
const multer=require('multer')

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'uploads/')
  },
  filename:(req,file,cb)=>{
    cb(null,randomString(10) + '-' + file.originalname);
  }
})
const fileFilter=(req,file,cb)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);  
   }}
const multerOptions={
  storage,
  fileFilter
}

app.use(express.urlencoded());
app.use(express.json());
app.use(multer(multerOptions).single("image"))
app.use(express.static(path.join(rootDir, 'public')))
app.use(express.static('.')); 
app.use("/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/product/uploads", express.static(path.join(rootDir, 'uploads')))

app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: true,
  store
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  req.isLoggedIn = req.session.isLoggedIn || false;
  next();
})

// Auth routes should come first (no protection needed)
app.use(authRouter);

// Store routes 
app.use(storeRouter);

// Protected host routes
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Make razorpay instance available to routes
app.locals.razorpay = razorpay;

// Add this middleware to make Razorpay key available in templates
app.use((req, res, next) => {
  res.locals.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
  next();
});

app.use(errorsController.pageNotFound);

const PORT = 2006;

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});