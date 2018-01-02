import constants from '../constants';
import { chain, callbackGetUser, getExpense } from '../middlewares';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleRemove(msg, data) {
  await chain.call(this, msg, data)(
    callbackGetUser,
    getExpense,
    async (query, data, next) => {
      const { expense, user } = data;
      const { id: queryId } = query;

      if (!expense.host.equals(user.get('id'))) {
        return this.answerCallbackQuery(queryId, 'Only owner can edit this expense');
      }

      expense.set({ removed: true });
      await expense.save();

      await expense.populate('host').execPopulate();

      this.sendMessage(
        query.message.chat.id,
        `Expense was removed
        \r\n\r\n${expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS, { user: expense.host })}`,
        {
          parse_mode: 'Markdown'
        }
      );
    }
  );
}
