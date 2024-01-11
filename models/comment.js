const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema } = mongoose;

const commentSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, Ref: 'User' },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, Ref: 'Post' },

});

commentSchema.virtual('commentDateFormatted').get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Comment', commentSchema);
