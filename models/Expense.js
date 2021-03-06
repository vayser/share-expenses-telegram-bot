import mongoose, { Schema } from 'mongoose';
import groupBy from 'lodash/groupBy';
import timestamps from 'mongoose-timestamp';
import constants from '../constants';

const { EXPENSE_STATUS, EXPENSE_REPLY_MARKUP, DEBTOR_STATUS } = constants;

const emoji = {
  debtorsAmount: ['', '', '👫', '👨‍👩‍👧', '👨‍👩‍👧‍👦'],
  [DEBTOR_STATUS.UNREPAID]: '',
  [DEBTOR_STATUS.REPAID]: '💵'
};

let ExpenseSchema = new Schema({
  amount: {
    type: Number
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
    default: EXPENSE_STATUS.ACTIVE,
    enum: [EXPENSE_STATUS.ACTIVE, EXPENSE_STATUS.COMMITED, EXPENSE_STATUS.CANCELED],
    required: true
  },
  title: {
    type: String
  },
  removed: {
    type: Boolean
  },
  locked: {
    type: Boolean
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

ExpenseSchema.methods.repay = async function(userId) {
  await this.model('Debtor').update({ user: userId, expense: this.get('id') }, { status: DEBTOR_STATUS.REPAID }, { multi: true });
};

ExpenseSchema.methods.unrepay = async function(userId) {
  await this.model('Debtor').update({ user: userId, expense: this.get('id') }, { status: DEBTOR_STATUS.UNREPAID }, { multi: true });
};

ExpenseSchema.methods.isUserRepaid = function(userId) {
  return this.debtors
    .filter(debtor => debtor.get('user').get('id') === userId)
    .every(debtor => {
      return debtor.status === DEBTOR_STATUS.REPAID;
    });
};

ExpenseSchema.methods.getReplyMarkup = function(markup, {
  share, remove, lock, unlock
} = {}) {
  if (markup === EXPENSE_REPLY_MARKUP.LIST) {
    const isRepaid = this.debtors.every(d => d.status === DEBTOR_STATUS.REPAID) && this.debtors.length > 0;

    const repaidIcon = isRepaid ? '✅' : '🛑';

    return [{
      text: `${repaidIcon} [ ${this.amount} ] : ✏️${this.title}`,
      callback_data: JSON.stringify({
        expenseId: this.get('id'),
        command: 'open'
      })
    }];
  }

  if (markup === EXPENSE_REPLY_MARKUP.DETAILS) {
    const debtors = groupBy(this.debtors, debtor => {
      return debtor.get('user').get('id');
    });

    return {
      inline_keyboard: [
        share && [{ switch_inline_query: this._id, text: '✉️ Share' }],
        remove && [{
          text: '❌ Remove',
          callback_data: JSON.stringify({
            command: 'remove',
            expenseId: this._id
          })
        }],
        lock && [{
          text: '🔒 Lock',
          callback_data: JSON.stringify({
            command: 'lock',
            expenseId: this._id
          })
        }],
        unlock && [{
          text: '🔓 Unlock',
          callback_data: JSON.stringify({
            command: 'unlock',
            expenseId: this._id
          })
        }],
        [{
          text: '+1 👍',
          callback_data: JSON.stringify({
            command: 'ok',
            expenseId: this.get('id')
          })
        }, {
          text: '-1 👎',
          callback_data: JSON.stringify({
            command: 'out',
            expenseId: this.get('id')
          })
        }],
        ...Object.keys(debtors).map((userId, index) => {
          const { firstName = '', lastName = '' } = debtors[userId][0].get('user');
          const isRepaid = this.isUserRepaid(userId);

          const userName = [firstName, lastName].join(' ').trim();
          const statusIcon = isRepaid ? emoji[DEBTOR_STATUS.REPAID] : emoji[DEBTOR_STATUS.UNREPAID];

          let btnText = `${++index}. ${statusIcon} ${userName} - $${Math.round(this.getPersonalCredit() * debtors[userId].length)}`;

          if (debtors[userId].length > 1) {
            btnText += ` x ${emoji.debtorsAmount[debtors[userId].length] || debtors[userId].length}`;
          }

          return [{
            text: btnText,
            callback_data: JSON.stringify({
              command: isRepaid ? 'unrepay' : 'repay',
              debtorId: debtors[userId][0].get('id')
            })
          }];
        })
      ].filter(Boolean)
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
  const credit = this.amount / (this.debtors.length); // 1 is host

  return Math.round(credit * 100) / 100;
};

ExpenseSchema.methods.getDebtorsListText = async function() {
  const debtors = await this.model('Debtor').find({ _id: { $in: this.debtors } }).populate('user');
  const personalCredit = this.getPersonalCredit();
  return debtors.map(d => {
    return `${d.user.toString()} - *${personalCredit}*`;
  }).join('\r\n');
};

ExpenseSchema.plugin(timestamps);

export default mongoose.model('Expense', ExpenseSchema);
