module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn || !req.session.user) {
    return res.redirect('/login');
  }
  
  // Set this for template access
  req.isLoggedIn = req.session.isLoggedIn;
  next();
};