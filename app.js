if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
};



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = process.env.PORT || 8080; 

//use ejs as view engine
app.set("view engine", "ejs");

//ejs-mate templeting improve
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);

//session falsh
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");


//method override
const methodOverride = require("method-override");
app.use(methodOverride('_method'));


//connect to database
const MONGO_URL = process.env.ATLASDB_URL;
main()
.then(res => console.log("Connected to DB."))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
};

//for populate error
mongoose.set("strictPopulate", false);

//set file path to dinamic
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
//req body data in urlencoded to say express
app.use(express.urlencoded({extended: true}));

//cloudinary config data
const {storage} = require("./cloudConfig.js");

//multer
const multer  = require('multer');
const upload = multer({ storage }); //storagedest: "uploads/"

//error handling middlewares
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

//create mongo online session store
const store =  MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET, 
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in MONGO SESSION STORE");
});

//use session falash
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false, 
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

app.use(session(sessionOption));
app.use(flash());





//user login packages
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//use passport related things
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//we access this all infomation in pages.
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currAdmin = req.session.admin;
  res.locals.currUser = req.user;
  next();
});


//items
//require models
const Item = require("./models/item.js");
const Review = require("./models/review.js");
const Category = require("./models/category.js");

app.get("/", (req, res) => {
  res.redirect("/item");
});

let randSort = require("./utils/sortRandom.js");
app.get("/item",wrapAsync( async (req, res) => {
  let items;
  if(req.query.cat){
    items = await Item.find({category: {_id : req.query.cat}});
  }else{
    items = await Item.find();
  }
  if(!items[0]){
    items = await Item.find();
  } 
  let categorys = await Category.find();
  items = randSort(items);
  res.render("items/index.ejs", {items, categorys});
}));

app.get("/item/:id",wrapAsync( async(req, res) => {
  let {id} = req.params;
  let item = await Item.findById(id)
  .populate({
    path: "reviews", populate: {path: "owner", strictPopulate: true}
  })
  .populate("owner");

  res.render("items/show.ejs",{item});
}));



//admin

const {isAdmin} = require("./adminAuth.js");

app.get("/admin", isAdmin, wrapAsync(async (req, res) => {
  let items = await Item.find();
  items.reverse();
  res.render("admin/adminPanel.ejs", {items});
}));

app.get("/admin/item/new",isAdmin, wrapAsync( async (req, res) => {

  let categorys = await Category.find();
  res.render("admin/newItem.ejs", {categorys});
}));

app.post("/admin/item", isAdmin, upload.single('item[image]'),wrapAsync( async (req, res) => {
  let {item} = req.body;
  let newItem = new Item(item);
  newItem = await newItem.save();
  newItem.image = {url: req.file.path, filename: req.file.filename};
  let saved = await newItem.save();
  req.flash("success", saved.name+" , added successfully!");
  res.redirect("/admin");
}));

app.get("/admin/item/edit/:id", isAdmin, wrapAsync( async(req, res) => {
  let {id} = req.params;
  let item = await Item.findById(id);
  let categorys = await Category.find();
  if(!item){
    req.flash("error", "Item dose not exist!");
    return res.redirect("/item");
  };
  res.render("admin/editItem.ejs", {item, categorys});
}));

app.put("/admin/item/edit/:id", upload.single('item[image]'), isAdmin, wrapAsync( async (req, res) => {
  let {id} = req.params;
  let {item} = req.body;
  if(typeof req.file !== "undefined"){
    item.image = {url: req.file.path, filename: req.file.filename};
  };
  let saved = await Item.findByIdAndUpdate(id, item);
  req.flash("success", saved.name+" , Edited successfully!");
  res.redirect("/admin");
}));

app.delete("/admin/item/destory/:id", isAdmin, wrapAsync( async(req, res) => {
  let {id} = req.params;
  let deleted = await Item.findByIdAndDelete(id); 
  req.flash("success", deleted.name+" , Deleted successfully!");
  res.redirect("/admin");
}));

//admin authorisation

app.get("/admin/login", (req, res) => {
  res.render("admin/login.ejs");
});


app.post("/admin/login", (req, res) => {
  if(req.user){
    req.logOut((err) => {
      if(err){
        return next(err);
      };
    });
  } 
  if(req.body.admin){
    if(req.body.admin.username && req.body.admin.password){
      if(req.body.admin.username.trim() === process.env.AD_USER && req.body.admin.password.trim() === process.env.AD_PASS){
        req.session.admin = req.body.admin;
        req.flash("success", "Login Successfull!");
        return res.redirect("/admin");
      }else{
        req.flash("error", "Wrong username or password!");
        return res.redirect("/admin/login");
      }
    }else{
      req.flash("error", "Invalid Request!");
      return res.redirect("/item");
    }
  }else{
    req.flash("error", "Invalid Request!");
    res.redirect("/item");
  }
});

app.get("/admin/logout", (req, res)=>{
  req.session.admin = undefined;
  req.flash("success", "Logout successful!");
  res.redirect("/item");
});


//users

app.get("/user/signup", (req, res) => {
  res.render("users/signup.ejs");
});

const sendOtp = require("./emailVerify/sendOtp.js");
const userExist = require("./emailVerify/userExist.js");

app.post("/user/verifyemail",wrapAsync(async (req, res) => {
  const user = req.body.user;
  if(user.username){
    await userExist(user.username, user.email, req, res);
  }
  const redirect = req.body.redirect;
  const otp = Math.floor(Math.random() * 100000);
  await sendOtp(user, otp);
  req.flash("success", "Sent OTP on your email");
  req.session.verify_data= {user, otp, redirect};
  res.redirect("/user/verifyemail");
}));

app.get("/user/verifyemail", (req, res) => {
  if(req.session.verify_data){
    let email = req.session.verify_data.user.email;
    let redirect = req.session.verify_data.redirect;
    return res.render("users/verifyEmail.ejs", {email, redirect});
  }
  req.flash("error", "Verify data not found!");
  res.redirect("/item");
});

app.post("/user/signup",wrapAsync( async (req, res) => {
  const {email, otp} = req.body;
  const userData = req.session.verify_data.user;
  const vOtp = req.session.verify_data.otp;
  if(email === userData.email){
    if(otp.toString() === vOtp.toString()){

      try{
        let {username, email, password} = userData;
        let newUser = new User({username, email});
        let registeredUser = await User.register(newUser, password);
        req.session.verify_data = "";
        req.login(registeredUser, (err)=> {
          if(err){
            return next(err);
          };
          if(req.session.admin){
            req.session.admin = undefined;
          }
          req.flash("success", `Welcome, ${username}`);
          return res.redirect("/item")
        });
      }catch(err){
        if(err.keyValue.email){
          req.flash("error", err.keyValue.email +", is already registered");
          return res.redirect("/user/login");
        }
        req.flash("error", err.message);
        return res.redirect("/user/signup");
      }

    }else{
      req.flash("error", "Wrong OTP!");
      return res.redirect("/user/verifyemail");
    }
    
  } else{
    req.flash("error", "Wrong Email!");
    return res.redirect("/user/signup");
  }
}));

app.get("/user/login", (req, res) => {
  res.render("users/login.ejs");
});

app.post("/user/login", passport.authenticate("local", {
  failureRedirect: "/user/login",
  failureFlash: true
}),wrapAsync(async (req, res) => {
  if(req.session.admin){
    req.session.admin = undefined
  }
  req.flash("success","Welcome back to Ramdev Furniture!");
  let redirectUrl = "/item";
  res.redirect(redirectUrl);
}));

app.get("/user/logout", (req, res)=> {
  req.logOut((err) => {
    if(err){
      return next(err);
    };
    req.flash("success", "You are logged out!");
    res.redirect("/user/login");
  });
});


app.get("/user/forgot", (req, res) => {
  res.render("users/forgotPass.ejs");
});

app.post("/user/forgot", wrapAsync(async(req, res) => {
  const {user} = req.body;
  let countuser = await User.findOne({email: user.email});
  if(!countuser){
    req.flash("error", `Email is not registered.`);
    return res.redirect("/user/signup");
  }
  const redirect = req.body.redirect;
  const otp = Math.floor(Math.random() * 100000);
  await sendOtp(user, otp);
  req.flash("success", "Sent OTP on your email");
  req.session.verify_data= {user, otp, redirect};
  res.redirect("/user/verifyemail");
}));

app.post("/user/reset", wrapAsync(async(req, res) => {
  const {email, otp} = req.body;
  const userData = req.session.verify_data.user;
  const vOtp = req.session.verify_data.otp;
  if(email === userData.email){
    if(otp.toString() === vOtp.toString()){

      try{
        const {email, password} = userData;
        const getUser = await User.findOne({email: email});
        await getUser.setPassword(password);
        const changeduser = await getUser.save();
        req.session.verify_data = undefined;
        req.login(changeduser, (err)=> {
          if(err){
            return next(err);
          };
          if(req.session.admin){
            req.session.admin = undefined;
          }
          req.flash("success", `password changed, ${email}`);
          return res.redirect("/item")
        });
      }catch(err){
        req.flash("error", err.message);
        return res.redirect("/user/forgot");
      }

    }else{
      req.flash("error", "Wrong OTP!");
      return res.redirect("/user/verifyemail");
    }
    
  } else{
    req.flash("error", "Wrong request!");
    return res.redirect("/user/signup");
  }
}));

//user profile
//cloudinary config data



const {isLoggedIn, isOwner} = require("./userAuth.js");

app.get("/user/profile", isLoggedIn, wrapAsync( async (req, res) => {
  let id = req.user._id;
  let user = await User.findById(id);
  if(user.image.url){
    user.image.url = user.image.url.replace("/upload", "/upload/q_40");
  };
  res.render("users/profile.ejs", {user});
}));


app.get("/user/profile/edit/:id", isLoggedIn, wrapAsync(async(req, res) => {
  let {id} = req.params;
  let user = await User.findById(id);
  if(user.image.url){
    user.image.url = user.image.url.replace("/upload", "/upload/q_10");
  };
  res.render("users/editProfile.ejs", {user});
}));

app.put("/user/profile/edit/:id", isLoggedIn, isOwner, upload.single('user[image]'),
  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let {user, address} = req.body;
    user.address = address;
    if(req.file){
      let {path, filename} = req.file
      user.image = {url: path, filename: filename};
    }
    let result = await User.findByIdAndUpdate(id, user);
    res.redirect("/user/profile");
  })
);


//reviews

app.post("/item/:id/review", isLoggedIn, wrapAsync(async (req, res)=>{
  let item = await Item.findById(req.params.id);
  req.body.review.owner = req.user._id;
  let newReview = new Review(req.body.review);
  item.reviews.push(newReview);
  await newReview.save();
  await item.save();
  req.flash("success", "Review Successfully Sent!");
  res.redirect(`/item/${req.params.id}`);
}));

app.delete("/item/:id/review/destory/:rid", isLoggedIn, wrapAsync( async(req, res)=>{
  let {id, rid} = req.params;

    let review = await Review.findById(rid);
    if(req.user && !review.owner.equals(req.user._id)){
      req.flash("error", "You are not owner of this Review");
      return res.redirect(`/item/${id}`);
    };

  await Item.findByIdAndUpdate(id, {$pull: {reviews : rid}});
  await Review.findByIdAndDelete(rid);
  req.flash("error", "Review Deleted!");
  
  res.redirect(`/item/${id}`);
}));



//category



app.get("/admin/category",isAdmin,  wrapAsync(async (req, res) => {
  const categorys = await Category.find();
  res.render("categorys/category.ejs", {categorys});
}));

app.get("/admin/category/new", isAdmin, (req, res) => {
  res.render("categorys/categoryNew.ejs");
});

app.post("/admin/category/new", isAdmin,  upload.single('category[image]'), wrapAsync(async(req, res) => {
  let {category} = req.body;
  category.image = {url: req.file.path, filename: req.file.filename};
  let newCategory = new Category(category);
  await newCategory.save(); 
  req.flash("success", "Category saved!");
  res.redirect("/admin/category");
}));

app.get("/admin/category/edit/:id", isAdmin, wrapAsync(async (req, res) => {
  let {id} = req.params;
  const category = await Category.findById(id);
  if(!category){
    req.flash("error", "Category does not exist!");
    return res.redirect("/item");
  }
  res.render("categorys/categoryEdit.ejs", {category});
}));

app.put("/admin/category/edit/:id", isAdmin, upload.single('category[image]'),wrapAsync( async (req, res) => {
  let {id} = req.params;
  let {category} = req.body;
  if(typeof req.file !== "undefined"){
    category.image = {url: req.file.path, filename: req.file.filename};
  };
  let saved = await Category.findByIdAndUpdate(id, category);
  req.flash("success", "Category , Edited successfully!");
  res.redirect("/admin/category");
}));

app.delete("/admin/category/destory/:id",isAdmin,  wrapAsync( async(req, res) => {
  let {id} = req.params;
  let deleted = await Category.findByIdAndDelete(id); 
  req.flash("success", "Category Deleted successfully!");
  res.redirect("/admin/category");
}));


//customers post
const Post = require("./models/post.js");

app.get("/post", wrapAsync(async (req, res) => {
  const posts = await Post.find();
  posts.reverse();
  res.render("posts/post.ejs", {posts});
}));

app.get("/admin/post/new", (req, res) => {
  res.render("posts/postNew.ejs");
});

app.post("/admin/post/new", upload.single('post[image]'), isAdmin, wrapAsync(async(req, res) => {
  let {post} = req.body;
  post.image = {url: req.file.path, filename: req.file.filename};
  let newPost = new Post(post);
  await newPost.save(); 
  req.flash("success", "Post added!");
  res.redirect("/post");
}));

app.get("/admin/post/edit/:id", isAdmin, wrapAsync(async (req, res) => {
  let {id} = req.params;
  const post = await Post.findById(id);
  if(!post){
    req.flash("error", "Category does not exist!");
    return res.redirect("/item");
  }
  res.render("posts/postEdit.ejs", {post});
}));

app.put("/admin/post/edit/:id", isAdmin, upload.single('post[image]'),wrapAsync( async (req, res) => {
  let {id} = req.params;
  let {post} = req.body;
  if(typeof req.file !== "undefined"){
    post.image = {url: req.file.path, filename: req.file.filename};
  };
  let saved = await Post.findByIdAndUpdate(id, post);
  req.flash("success", "Post , Edited successfully!");
  res.redirect("/post");
}));

app.delete("/admin/post/destory/:id", isAdmin, wrapAsync( async(req, res) => {
  let {id} = req.params;
  let deleted = await Post.findByIdAndDelete(id); 
  req.flash("success", "Post Deleted successfully!");
  res.redirect("/post");
}));



//error handling routes
app.all("*", (req, res, next) => {
  res.redirect("/item");
});

app.use((err, req, res, next) => {
  console.log(err);
  let {status = 500, message = "Something Went Wrong!"} = err;
  res.status(status).render("error.ejs",{ message });
});

//listing
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});