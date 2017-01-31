import Expense from '../models/Expense';
import { chain, getChat, getUser } from '../middlewares';
import constants from '../constants';

const { EXPENSE_REPLY_MARKUP } = constants;

export default async function handleList(msg, data) {
  await chain.call(this, msg, data)(
    getChat,
    getUser,
    async (msg, data, next) => {
      const {
        chat: { type }
      } = msg;

      const { chat, user } = data;

      let expenses;
      let text;

      if (type === 'private') {
        expenses = await Expense.find({ host: user.get('id') }).populate('chat');
        text = 'List of your expenses for *ALL* chats';
      } else {
        expenses = await Expense.find({ host: user.get('id'), chat: chat.get('id') }).populate('chat');
        text = 'List of your expenses for *CURRENT* chats';
      }

      this.sendMessage(chat.get('telegramId'), text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            ...expenses.map(expense => {
              return expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.LIST);
            })
          ]
        }
      });
    }
  );
}
