import Expense from '../models/Expense';
import moment from 'moment';
import _ from 'lodash';
import { chain, getChat, getUser } from '../middlewares';
import constants from '../constants';

const { EXPENSE_REPLY_MARKUP, DEBTOR_STATUS } = constants;

export default async function handleList(msg, data) {
  await chain.call(this, msg, data)(
    getChat,
    getUser,
    async (msg, data, next) => {
      const { chat, user } = data;

      let expenses = await Expense.find({
        removed: { $ne: true },
        host: user.get('id')
      })
      .populate('chat debtors')
      .sort({ createdAt: -1 });

      let text = 'List of your expenses';

      expenses = _.groupBy(expenses, e => e.debtors.every(d => d.status === DEBTOR_STATUS.REPAID) && e.debtors.length > 0);

      this.sendMessage(chat.get('telegramId'), text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            ...expenses.false.sort((a, b) => moment(a.createdAt).isBefore(moment(b.createdAt))).map(expense => {
              return expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.LIST);
            }),
            ...expenses.true.sort((a, b) => moment(a.createdAt).isBefore(moment(b.createdAt))).map(expense => {
              return expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.LIST);
            })
          ]
        }
      });
    }
  );
}
