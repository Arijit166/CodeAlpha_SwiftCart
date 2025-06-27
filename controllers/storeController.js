const Home = require("../models/home");
const Favourite=require("../models/favourite")

exports.getIndex = (req, res, next) => {
  Home.fetchAll((registeredHomes) =>
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
    })
  );
};

exports.getHomes = (req, res, next) => {
  Home.fetchAll((registeredHomes) =>
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
    })
  );
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
  })
};

exports.getFavouriteList = (req, res, next) => {
  Favourite.getFavourites(favourites =>{
    Home.fetchAll((registeredHomes) =>{
    const favouriteHomes=registeredHomes.filter(home => favourites.includes(home.id))
    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
    })
    })
  })
}

exports.postAddToFavourites=(req,res,next)=>{
  console.log("Came to Add to favourites",req.body)
  Favourite.addToFavourites(req.body.id, error =>{
    if(error){
      console.log("Error while marking favourite")
    }
    res.redirect("/favourites")
  })
}

exports.getHomeDetails = (req, res, next) => {
  const homeId=req.params.homeId;
  Home.findbyId(homeId,home=>{
    if (!home){
      console.log("Home not found")
      res.redirect("/homes")
    }else{
    res.render("store/home-detail", {
      home: home,
      pageTitle: "Home Detail",
      currentPage: "home",
  })
   }
   })
  }
