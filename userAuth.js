module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    req.flash("error", "You must be logged in!");
    return res.redirect("/user/login");
  };
  return next();
};

const User = require("./models/user.js");

module.exports.isOwner = async (req, res, next) => {
  let {id} = req.params;
  let user = await User.findById(id);
  if(req.user && !user._id.equals(req.user._id)){
    req.flash("error", "You are not this user.");
    return res.redirect("/user/login");
  };
  return next();
};



