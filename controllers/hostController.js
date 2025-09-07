const Product = require("../models/product");
const fs=require('fs')
exports.getAddProduct = (req, res, next) => {
  res.render("host/edit-product", {
    pageTitle: "Add Product to SwiftCart",
    currentPage: "addProduct",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
  });
};

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  const editing = req.query.editing === 'true';

  Product.findById(productId) .then(product => {
    if (!product) {
      console.log("Product not found for editing.");
      return res.redirect("/host/product-list");
    }

    console.log(productId, editing, product);
    res.render("host/edit-product", {
      product: product,
      pageTitle: "Edit your Product",
      currentPage: "products",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.find().then((registeredProducts)=>{
    res.render("host/product-list", {
      registeredProducts: registeredProducts,
      pageTitle: "Product List",
      currentPage: "products",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    })
});
};

exports.postAddProduct = (req, res, next) => {
  const { name, price, rating, description } = req.body;
  if (!req.file) {
    return res.status(400).send("No image file uploaded.");
  }
  const image = req.file.path;
  const product = new Product({ name, price, rating, image, description });

  product.save()
    .then(() => {
      console.log("Product saved successfully");
      res.render("host/product-added", {
        pageTitle: "Product Added Successfully",
        currentPage: "",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    })
    .catch(err => {
      console.log("Error while saving product", err);
      res.status(500).send("Something went wrong.");
    });
};


exports.postEditProduct = (req, res, next) => {
  const { id, name, price, rating, description } = req.body;
  Product.findById(id).then((product)=>{
    product.name=name;
    product.price=price;
    product.rating=rating;
    product.description=description
    if (req.file) {
      fs.unlink(product.image, (err)=>{
        if (err){
          console.log("Error while deleting file",err)
        }
      })
      product.image = req.file.path; 
    }
    product.save().then(result=>{
      console.log("Product Updated",result)
  }).catch(err=>{
    console.log("Error while uploading",err)
  })
  res.redirect("/host/product-list");
}).catch(err=>{
  console.log("Error while finding product",err)
})
};

const path = require('path');
const rootDir = path.dirname(require.main.filename);

 exports.postDeleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        console.log("Product not found");
        return res.redirect("/host/product-list");
      }

      // Absolute path to the image file
      const imagePath = path.join(rootDir, product.image);

      // Delete the image file
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting image file:", err);
        } else {
          console.log("Image file deleted:", imagePath);
        }
      });

      // Delete the document from the DB
      return Product.findByIdAndDelete(productId);
    })
    .then(() => {
      res.redirect("/host/product-list");
    })
    .catch((error) => {
      console.log("Error while deleting product:", error);
    });
};

