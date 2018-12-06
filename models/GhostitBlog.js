const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var contentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  bold: {
    type: Boolean,
    required: true
  },
  italic: {
    type: Boolean,
    required: true
  },
  underline: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  location: {
    type: Number,
    required: true
  }
});
var imageSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  publicID: {
    type: String,
    required: true
  },
  size: String,
  location: Number
});

const ghostitBlogSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    category: {
      type: String
    },
    contentArray: [contentSchema],
    images: [imageSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ghostitBlogs", ghostitBlogSchema);
