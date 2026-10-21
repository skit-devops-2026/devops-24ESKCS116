const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

// Add virtual `id` field and remove __v, _id when converting to JSON
projectSchema.method('toJSON', function () {
  const { __v, _id, ...obj } = this.toObject();
  obj.id = _id.toString();
  return obj;
});

module.exports = mongoose.model('Project', projectSchema);
