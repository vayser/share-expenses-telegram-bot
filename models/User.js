import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { findOrCreate } from '../db/plugins';

let UserSchema = new Schema({
  telegramId: {
    type: Number,
    required: true
  },
  firstName: String,
  lastName: String,
  username: String
});

UserSchema.methods.toString = function() {
  return `${this.firstName} @${this.username} ${this.lastName}`;
};

UserSchema.plugin(timestamps);
UserSchema.plugin(findOrCreate);

export default mongoose.model('User', UserSchema);
