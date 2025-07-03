const Home = require("../models/home");
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to Homezy",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true';

  Home.findById(homeId) .then(home => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes)=>{
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn
    })
});
};

exports.postAddHome = (req, res, next) => {
  const { name, price, location, rating, imageUrl, description } = req.body;
  const home = new Home({name, price, location, rating, imageUrl, description});
  home.save().then(()=>{
    console.log("Home saved successfully")
  })
  res.redirect("/host/host-home-list");
};

exports.postEditHome = (req, res, next) => {
  const { id, name, price, location, rating, imageUrl, description } = req.body;
  Home.findById(id).then((home)=>{
    home.name=name;
    home.price=price;
    home.location=location;
    home.rating=rating;
    home.imageUrl=imageUrl;
    home.description=description
    home.save().then(result=>{
      console.log("Home Updated",result)
  }).catch(err=>{
    console.log("Error while uploading",err)
  })
  res.redirect("/host/host-home-list");
}).catch(err=>{
  console.log("Error while finding home",err)
})
};

exports.postDeleteHome = (req, res, next) => {
  const homeId=req.params.homeId
  console.log("Came to delete homeId",homeId)
  Home.findByIdAndDelete(homeId).then(() =>{
    res.redirect("/host/host-home-list");
  }).catch(error =>{
    console.log("Error while deleting ",error)
  })
}