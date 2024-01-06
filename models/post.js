const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema } = mongoose;

const postSchema = new Schema({
  image: {
    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number,
  },
  title: { Type: String, required: true },
  content: { Type: String, required: true },
  date: { Type: Date, required: true },
  isPublished: { Type: Boolean, required: true },
});

postSchema.virtual('postDateFormatted').get(function () {
  return DateTime.fromJSDate(this.datePosted).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Post', postSchema);
