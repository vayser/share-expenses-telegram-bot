import constants from '../constants';
import { chain, getCallbackUser, getExpense, getDebtor } from '../middlewares';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleRepaid(msg, data) {
  await chain.call(this, msg, data)(
    getCallbackUser,
    getExpense,
    getDebtor,
    async (msg, data, next) => {
      const { expense, callbackUser, debtor } = data;
      const { queryId, message_id, chat: { id: chat_id } } = msg;

      if (!expense.host.equals(callbackUser.get('id'))) {
        return this.answerCallbackQuery(queryId, 'Only owner can edit this expense');
      }

      await expense.unrepay(debtor.get('user'));

      await expense.populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      }).execPopulate();

      await this.editMessageText(expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
        message_id,
        chat_id,
        parse_mode: 'Markdown',
        reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
      });

      this.answerCallbackQuery(queryId, '');
    }
  );
}
