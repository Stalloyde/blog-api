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

  user: { type: mongoose.Schema.Types.ObjectId, Ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  isPublished: { type: Boolean, required: true },
  comments: { type: mongoose.Schema.Types.ObjectId, Ref: 'Comment' },
});

postSchema.virtual('postDateFormatted').get(function () {
  return DateTime.fromJSDate(this.datePosted).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Post', postSchema);
