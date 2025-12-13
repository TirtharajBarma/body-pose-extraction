import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'images'
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
