import constants from '../constants';
import { chain, callbackGetUser, getExpense } from '../middlewares';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleRepaid(query, data) {
  await chain.call(this, query, data)(
    callbackGetUser,
    getExpense,
    async (query, data, next) => {
      const { expense, user } = data;
      const { id: queryId, message: { chat: { id: chatId } } } = query;

      if (!expense.host.equals(user.get('id'))) {
        return this.answerCallbackQuery(queryId, 'Only owner can edit this expense');
      }

      expense.set({ locked: false });
      await expense.save();

      await expense.populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      }).execPopulate();

      this.editMessageText(expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS), {
        message_id: query.message.message_id,
        chat_id: query.message.chat.id,
        parse_mode: 'Markdown',
        reply_markup: expense.getReplyMarkup(
          EXPENSE_REPLY_MARKUP.DETAILS,
          { share: true, remove: true, lock: !expense.locked, unlock: expense.locked }
        )
      });

      this.sendMessage(chatId, 'Expense was unlocked, everyone can apply now');
    }
  );
}
