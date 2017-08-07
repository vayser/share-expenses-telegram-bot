import Debtor from '../models/Debtor';
import Expense from '../models/Expense';
import constants from '../constants';
import { chain, callbackGetUser } from '../middlewares';
const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleOut(query, data) {
  await chain.call(this, query, data)(
    callbackGetUser,
    async (query, data, next) => {
      const { expenseId, user } = data;
      const { id: queryId } = query;

      const expense = await Expense.findById(expenseId);

      if (expense.locked) {
        return this.answerCallbackQuery(queryId, 'Expense was locked');
      }

      const { debtors: debtorsIdList } = expense;

      const debtor = await Debtor.findOne({
        _id: { $in: debtorsIdList },
        user: user.get('id')
      });

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

      if (query.inline_message_id) {
        await this.editMessageText(updatedExpense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
          inline_message_id: query.inline_message_id,
          parse_mode: 'Markdown',
          reply_markup: updatedExpense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
        });
      } else {
        await this.editMessageText(updatedExpense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
          message_id: query.message.message_id,
          chat_id: query.message.chat.id,
          parse_mode: 'Markdown',
          reply_markup: updatedExpense.getReplyMarkup(
            EXPENSE_REPLY_MARKUP.DETAILS,
            { share: true, remove: true, lock: !updatedExpense.locked, unlock: updatedExpense.locked }
          )
        });
      }

      this.answerCallbackQuery(queryId, 'You are leaved expense');
    }
  );
}
