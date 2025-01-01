

module.exports.isAdmin = (req, res, next) => {
  if(req.session.admin){
    if(req.session.admin.username === process.env.AD_USER && req.session.admin.password === process.env.AD_PASS){   
      return next();
    }else{
      req.flash("error", "You are not Admin!");
      return res.redirect("/");
    };
  }
  req.flash("error", "Please First Login!");
  return res.redirect("/admin/login");
};