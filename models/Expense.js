import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import constants from '../constants';

const { EXPENSE_STATUS, EXPENSE_REPLY_MARKUP } = constants;

let ExpenseSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  chat: {
    ref: 'Chat',
    type: Schema.Types.ObjectId
  },
  host: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  notes: [{
    text: String,
    date: Date
  }],
  debtors: [{
    ref: 'Debtor',
    type: Schema.Types.ObjectId
  }],
  status: {
    type: String,
    enum: [EXPENSE_STATUS.ACTIVE, EXPENSE_STATUS.COMMITED, EXPENSE_STATUS.CANCELED],
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

ExpenseSchema.methods.getMessageText = function(markup, { user } = {}) {
  user = user || this.get('host');
  const { username } = user;
  const { amount, title } = this;

  const detailsText = `Author: ${user.firstName} @${username} ${user.lastName} \r\nExpense: *${title}*\r\nAmount: *${amount}*`;

  if (markup === EXPENSE_REPLY_MARKUP.DETAILS) {
    return detailsText;
  }
};

ExpenseSchema.methods.getReplyMarkup = function(markup) {
  if (markup === EXPENSE_REPLY_MARKUP.DETAILS) {
    return {
      inline_keyboard: [
        [{
          text: '✅ YES',
          callback_data: JSON.stringify({
            command: 'ok',
            expenseId: this.get('id')
          })
        }, {
          text: '❌ NO',
          callback_data: JSON.stringify({
            command: 'out',
            expenseId: this.get('id')
          })
        }],
        ...this.debtors.map((debtor, index) => {
          const { firstName, lastName } = debtor.get('user');
          return [{
            text: `${++index}. ${firstName} ${lastName} - $${this.getPersonalCredit()}`,
            callback_data: JSON.stringify({
              command: 'out',
              expenseId: this.get('id')
            })
          }];
        })
      ]
    };
  }
};

ExpenseSchema.methods.isHost = async function(user) {
  if (!user) {
    return false;
  }

  if (typeof user === 'number') {
    const telegramId = user;

    const host = await this.model('User').findOne({ telegramId });

    if (!host) {
      return false;
    }

    return this.host.equals(host.get('id'));
  }

  return this.host.equals(user.get('id'));
};

ExpenseSchema.methods.commit = async function() {
  this.set('status', EXPENSE_STATUS.COMMITED);
  await this.save();
};

ExpenseSchema.methods.getPersonalCredit = function() {
  const credit = this.amount / (this.debtors.length + 1); // 1 is host

  return Math.round(credit * 100) / 100;
};

ExpenseSchema.methods.getDebtorsListText = async function() {
  const debtors = await this.model('Debtor').find({ _id: { $in: this.debtors } }).populate('user');
  const personalCredit = this.getPersonalCredit();
  return debtors.map(d => {
    return `${d.user.toString()} - *${personalCredit}*`;
  }).join('\r\n');
};

ExpenseSchema.statics.getActiveExpense = async function(options) {
  const { chatId } = options;

  const chat = await this.model('Chat').findOne({ telegramId: chatId });

  if (!chat) {
    return;
  }

  const expense = await this.findOne({
    chat: chat.get('id'),
    status: EXPENSE_STATUS.ACTIVE
  });

  return expense;
};

ExpenseSchema.plugin(timestamps);

export default mongoose.model('Expense', ExpenseSchema);
