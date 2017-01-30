import Expense from '../models/Expense';
import Debtor from '../models/Debtor';
import constants from '../constants';
import { chain, getCallbackUser } from '../middlewares';

const { EXPENSE_REPLY_MARKUP, DEBTOR_STATUS } = constants;

export default async function handleOk(msg, data) {
  await chain.call(this, msg, data)(
    getCallbackUser,
    async (msg, data, next) => {
      const { expenseId, callbackUser } = data;
      const { queryId, message_id, chat: { id: chat_id } } = msg;

      const expense = await Expense.findById(expenseId);

      const debtor = await Debtor.create({
        user: callbackUser.get('id'),
        expense: expense.get('id'),
        status: DEBTOR_STATUS.UNREPAID
      });

      expense.set('debtors', [
        ...expense.debtors,
        debtor.get('id')
      ]);

      await expense.populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      }).execPopulate();

      await expense.save();

      await this.editMessageText(expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
        message_id,
        chat_id,
        parse_mode: 'Markdown',
        reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
      });

      this.answerCallbackQuery(queryId, 'You are applied to expense');
    }
  );
}
