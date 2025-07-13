const Home = require("../models/home");
const fs=require('fs')
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to Homezy",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
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
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes)=>{
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    })
});
};

exports.postAddHome = (req, res, next) => {
  const { name, price, location, rating, description } = req.body;
  if (!req.file) {
    return res.status(400).send("No image file uploaded.");
  }
  const image = req.file.path;
  const home = new Home({ name, price, location, rating, image, description });

  home.save()
    .then(() => {
      console.log("Home saved successfully");
      res.render("host/home-added", {
        pageTitle: "Home Added Successfully",
        currentPage: "",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    })
    .catch(err => {
      console.log("Error while saving home", err);
      res.status(500).send("Something went wrong.");
    });
};


exports.postEditHome = (req, res, next) => {
  const { id, name, price, location, rating, description } = req.body;
  Home.findById(id).then((home)=>{
    home.name=name;
    home.price=price;
    home.location=location;
    home.rating=rating;
    home.description=description
    if (req.file) {
      fs.unlink(home.image, (err)=>{
        if (err){
          console.log("Error while deleting file",err)
        }
      })
      home.image = req.file.path; 
    }
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

const path = require('path');
const rootDir = path.dirname(require.main.filename);

 exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Came to delete homeId", homeId);

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("Home not found");
        return res.redirect("/host/host-home-list");
      }

      // Absolute path to the image file
      const imagePath = path.join(rootDir, home.image);

      // Delete the image file
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting image file:", err);
        } else {
          console.log("Image file deleted:", imagePath);
        }
      });

      // Delete the document from the DB
      return Home.findByIdAndDelete(homeId);
    })
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error while deleting home:", error);
    });
};

