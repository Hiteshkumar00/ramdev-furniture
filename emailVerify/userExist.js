const User = require("../models/user.js");


async function userExist(req, res, next) {
  const {username, email} = req.body.user;
  let users = await User.find({username: username});
  if(users.length > 0){
    req.flash("error", `"@${username}", use diffrent username!`);
    return res.redirect("/user/signup");
  }
  let emails = await User.find({email: email});
  if(emails.length > 0){
    req.flash("error", `"Email is already exist!`);
    return res.redirect("/user/login");
  }
  next();
}

module.exports = userExist;