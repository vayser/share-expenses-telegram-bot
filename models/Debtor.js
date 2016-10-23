import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import constants from '../constants';

const { DEBTOR_STATUS } = constants;

let Debtor = new Schema({
  user: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  expense: {
    ref: 'Expense',
    type: Schema.Types.ObjectId
  },
  status: {
    type: String,
    enum: [DEBTOR_STATUS.ACTIVE, DEBTOR_STATUS.CLOSED, DEBTOR_STATUS.OUT]
  }
});

Debtor.plugin(timestamps);

export default mongoose.model('Debtor', Debtor);
