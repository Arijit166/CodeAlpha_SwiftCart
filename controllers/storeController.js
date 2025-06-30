const Favourite = require("../models/favourite");
const Home = require("../models/home");

exports.getIndex = (req, res, next) => {
  Home.fetchAll().then((registeredHomes)=>{
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homezy home",
      currentPage: "index",
  })
})
}

exports.getHomes = (req, res, next) => {
  Home.fetchAll().then((registeredHomes)=>{
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
    })
});
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
  })
};

exports.getFavouriteList = (req, res, next) => {
  Favourite.getFavourites().then(favourites => {
    favourites=favourites.map(fav => fav.homeId);
    Home.fetchAll().then((registeredHomes)=>{
      const favouriteHomes = registeredHomes.filter(home => favourites.includes(home._id.toString()));
      res.render("store/favourite-list", {
        favouriteHomes: favouriteHomes,
        pageTitle: "My Favourites",
        currentPage: "favourites",
      })
    });
  })
};

exports.postAddToFavourite = (req, res, next) => {
  const homeId=req.body.id
  const fav=new Favourite(homeId)
  fav.save().then(result =>{
    console.log("Fav added",result)
  }).catch (error =>{
    console.log("Error while marking favourite: ", error);
  }).finally(()=>{
     res.redirect("/favourites");
  })
}

exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;
  Favourite.deleteById(homeId).then(result =>{
    console.log("Fav removed",result)
  }).catch (error =>{
    console.log("Error while removing favourite: ", error);
  }).finally(()=>{
     res.redirect("/favourites");
  })
}

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
      });
    }
  })
};