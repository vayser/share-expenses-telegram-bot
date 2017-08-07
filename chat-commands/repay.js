import constants from '../constants';
import { chain, callbackGetUser, getExpense, getDebtor } from '../middlewares';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleRepaid(query, data) {
  await chain.call(this, query, data)(
    callbackGetUser,
    getExpense,
    getDebtor,
    async (query, data, next) => {
      const { expense, user, debtor } = data;
      const { id: queryId } = query;

      if (!expense.host.equals(user.get('id'))) {
        return this.answerCallbackQuery(queryId, 'Only owner can edit this expense');
      }

      await expense.repay(debtor.get('user'));

      await expense.populate('host').populate({
        path: 'debtors',
        populate: {
          path: 'user'
        }
      }).execPopulate();

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

      this.answerCallbackQuery(queryId, '');
    }
  );
}
