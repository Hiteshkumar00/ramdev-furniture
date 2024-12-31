const mongoose = require("mongoose");
const {Schema} = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String
  },
  price: Number,
  key: {
    type: Array,
  },
  Value: {
    type: Array,
  },
  reviews: [{ type: Schema.Types.ObjectId , ref: "Review"}],
  category: String
});

//all reviews delete of their item
const Review = require("./review.js");
const category = require("./category.js");

itemSchema.post("findOneAndDelete", async (item) => {
  if(item){
    await Review.deleteMany({_id : {$in : item.reviews}});
  }
});

module.exports = mongoose.model("Item", itemSchema);