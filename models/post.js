const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema } = mongoose;

const postSchema = new Schema({
  image: { type: Object },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  isPublished: { type: Boolean, required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

postSchema.virtual('postDateFormatted').get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Post', postSchema);
