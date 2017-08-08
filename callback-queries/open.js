import { chain, getExpense } from '../middlewares';
import constants from '../constants';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleList(query, data) {
  await chain.call(this, query, data)(
    getExpense,
    async (query, data, next) => {
      const {
        id: queryId,
        message: { chat: { id: chatId } }
      } = query;

      const { expense } = data;

      await expense.populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      }).execPopulate();

      this.sendMessage(chatId, expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
        parse_mode: 'Markdown',
        reply_markup: expense.getReplyMarkup(
          EXPENSE_REPLY_MARKUP.DETAILS,
          { share: true, remove: true, lock: !expense.locked, unlock: expense.locked }
        )
      });

      this.answerCallbackQuery(queryId, '');
    }
  );
}
