const User = require("../models/user.js");


async function userExist(username, email, req, res) {
  let users = await User.find({username: username});
  if(users.length > 0){
    req.flash("error", `"@${username}", is already exist!`);
    return res.redirect("/user/signup");
  }
  let emails = await User.find({email: email});
  if(emails.length > 0){
    req.flash("error", `"${email}", is already exist!`);
    return res.redirect("/user/login");
  }
}

module.exports = userExist;