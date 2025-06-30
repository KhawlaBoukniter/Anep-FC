const mongoose = require('mongoose');

const userNeedSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true,
    maxlength: [50, 'Sender name cannot be more than 50 characters']
  },
  title: {
    type: String,
    trim: false,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    trim: false,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the `updatedAt` field on document update
userNeedSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const UserNeed = mongoose.model('UserNeed', userNeedSchema);

module.exports = UserNeed;