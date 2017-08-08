import Expense from '../models/Expense';
import Debtor from '../models/Debtor';
import constants from '../constants';
import { chain, callbackGetUser } from '../middlewares';

const { EXPENSE_REPLY_MARKUP, DEBTOR_STATUS } = constants;

export default async function handleOk(query, data) {
  await chain.call(this, query, data)(
    callbackGetUser,
    async (query, data, next) => {
      const { expenseId, user } = data;
      const { id: queryId } = query;

      const expense = await Expense.findById(expenseId);

      if (expense.locked) {
        return this.answerCallbackQuery(queryId, 'Expense was locked');
      }

      const debtor = await Debtor.create({
        user: user.get('id'),
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

      if (query.inline_message_id) {
        await this.editMessageText(expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
          inline_message_id: query.inline_message_id,
          parse_mode: 'Markdown',
          reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
        });
      } else {
        await this.editMessageText(expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
          message_id: query.message.message_id,
          chat_id: query.message.chat.id,
          parse_mode: 'Markdown',
          reply_markup: expense.getReplyMarkup(
            EXPENSE_REPLY_MARKUP.DETAILS,
            { share: true, remove: true, lock: !expense.locked, unlock: expense.locked }
          )
        });
      }

      this.answerCallbackQuery(queryId, 'You are applied to expense');
    }
  );
}
