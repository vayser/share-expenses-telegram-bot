import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { findOrCreate } from '../db/plugins';

let ChatSchema = new Schema({
  telegramId: {
    type: Number,
    required: true
  },
  type: String,
  title: String
});

ChatSchema.plugin(timestamps);
ChatSchema.plugin(findOrCreate);

export default mongoose.model('Chat', ChatSchema);
