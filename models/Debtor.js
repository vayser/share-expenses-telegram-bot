import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

let Debtor = new Schema({
  user: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  expense: {
    ref: 'Expense',
    type: Schema.Types.ObjectId
  }
});

Debtor.plugin(timestamps);

export default mongoose.model('Debtor', Debtor);
