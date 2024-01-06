const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema();

const commentSchema = new Schema({
  user: { Type: mongoose.Schema.Types.ObjectId, Ref: 'User' },
  content: { Type: String, required: true },
  date: { Type: Date, required: true },
});

commentSchema.virtual('commentDateFormatted').get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Comment', commentSchema);
