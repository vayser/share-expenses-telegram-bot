import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

let ExpenseSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  notes: [{
    text: String,
    date: Date
  }],
  host: {
    ref: 'Participant',
    type: Schema.Types.ObjectId
  },
  chat: {
    ref: 'Chat',
    type: Schema.Types.ObjectId
  },
  participants: [{
    ref: 'Participant',
    type: Schema.Types.ObjectId
  }]
});

ExpenseSchema.plugin(timestamps);

export default mongoose.model('Expense', ExpenseSchema);
