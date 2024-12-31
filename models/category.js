const mongoose = require("mongoose");
const {Schema} = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String
  }
});

module.exports = mongoose.model("Category", categorySchema);