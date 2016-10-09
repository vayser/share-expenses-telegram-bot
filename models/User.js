import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { findOrCreate } from '../db/plugins';

let User = new Schema({
  telegramId: {
    type: Number,
    required: true
  },
  firstName: String,
  lastName: String,
  username: String
});

User.plugin(timestamps);
User.plugin(findOrCreate);

export default mongoose.model('User', User);
