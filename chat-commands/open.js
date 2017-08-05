import { chain, getExpense } from '../middlewares';
import constants from '../constants';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleList(msg, data) {
  await chain.call(this, msg, data)(
    getExpense,
    async (msg, data, next) => {
      const {
        queryId,
        chat_id
      } = msg;

      const { expense } = data;

      await expense.populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      }).execPopulate();

      this.sendMessage(chat_id, expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
        parse_mode: 'Markdown',
        reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS, { share: true })
      });

      this.answerCallbackQuery(queryId, '');
    }
  );
}
