import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { findOrCreate } from '../db/plugins';

import constants from '../constants';
const { EXPENSE_FLOW_PHASES } = constants;

let UserSchema = new Schema({
  telegramId: {
    type: Number,
    required: true
  },
  firstName: String,
  lastName: String,
  username: String,
  createExpenseFlowStatus: {
    type: String,
    enum: [EXPENSE_FLOW_PHASES.READY, EXPENSE_FLOW_PHASES.WAITING_FOR_AMOUNT, EXPENSE_FLOW_PHASES.WAITING_FOR_TITLE]
  },
  incompletedExpense: {
    ref: 'Expense',
    type: Schema.Types.ObjectId
  }
});

UserSchema.methods.toString = function() {
  return `${this.firstName} @${this.username} ${this.lastName}`;
};

UserSchema.plugin(timestamps);
UserSchema.plugin(findOrCreate);

export default mongoose.model('User', UserSchema);
