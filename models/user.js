const mongoose = require("mongoose");
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone_no:{
    type: String,
    default: "+91 7984X XXXXX"
  },
  name: {
    type: String,
    default: "Tony Stark"
  },
  image:{
    url:{
      type: String,
      default: "https://res.cloudinary.com/dklooe01h/image/upload/q_40/v1735405348/ramdev_furniture_item/rukabjgfowjardtuftru.jpg"
    },
    filename: String
  },
  address:{ 
    location: {
      type: String,
      default: "Bopal, Ahmedabad"
    },
    town: {
      type: String,
      default: "Bopal"
    },
    city: {
      type: String,
      default: "Ahmedabad"
    },
    pincode: {
      type: Number,
      default: 380058
    },
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);