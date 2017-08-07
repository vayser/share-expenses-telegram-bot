import constants from '../constants';
import { chain, getCallbackUser, getExpense } from '../middlewares';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleRepaid(msg, data) {
  await chain.call(this, msg, data)(
    getCallbackUser,
    getExpense,
    async (msg, data, next) => {
      const { expense, callbackUser } = data;
      const { queryId, chat_id } = msg;

      if (!expense.host.equals(callbackUser.get('id'))) {
        return this.answerCallbackQuery(queryId, 'Only owner can edit this expense');
      }

      expense.set({ removed: true });
      await expense.save();

      await expense.populate('host').execPopulate();

      this.sendMessage(
        chat_id,
        `Expense was removed
        \r\n\r\n${expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS, { user: expense.host })}`,
        {
          parse_mode: 'Markdown'
        }
      );
    }
  );
}
