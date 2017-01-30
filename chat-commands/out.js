import Debtor from '../models/Debtor';
import Expense from '../models/Expense';
import constants from '../constants';
import { chain, getCallbackUser, getExpense } from '../middlewares';
const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleOut(msg, data) {
  await chain.call(this, msg, data)(
    getCallbackUser,
    getExpense,
    async (msg, data, next) => {
      const { queryId, message_id, chat: { id: chat_id } } = msg;
      const { expense, callbackUser } = data;
      const { debtors: debtorsIdList } = expense;

      const debtor = await Debtor.findOne({ _id: { $in: debtorsIdList }, user: callbackUser.get('id') });

      if (!debtor) {
        return this.answerCallbackQuery(queryId, 'You were not applied to this expense');
      }

      await Expense.update({
        _id: expense.get('id')
      }, {
        $pull: {
          debtors: debtor.get('id')
        }
      });

      const updatedExpense = await Expense.findById(expense.get('id')).populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      });

      await this.editMessageText(updatedExpense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
        message_id,
        chat_id,
        parse_mode: 'Markdown',
        reply_markup: updatedExpense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
      });

      this.answerCallbackQuery(queryId, 'You are leaved expense');
    }
  );
}
