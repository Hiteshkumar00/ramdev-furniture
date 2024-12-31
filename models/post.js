const mongoose = require("mongoose");
const {Schema} = mongoose;

const postSchema = new Schema({
  image: {
    url: String,
    filename: String
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = mongoose.model("Post", postSchema);