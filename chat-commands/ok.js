import Chat from '../models/Chat';
import User from '../models/User';
import Expense from '../models/Expense';
import constants from '../constants';
const { EXPENSE_STATUS } = constants;

export default async function handleOk(msg, match) {
  const {
    text,
    chat: {
      id: chatId,
      title: chatTitle,
      type: chatType
    },
    from: {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username
    }
  } = msg;

  const NO_ACTIVE_EXPENSE_TEXT = `\`ERROR\`: @${username}, there are no active expenses in chat`;

  const chat = await Chat.findOrCreate({ telegramId: chatId }, {
    title: chatTitle,
    type: chatType,
    telegramId: chatId
  });

  const expense = await Expense.findOne({
    chat: chat.get('id'),
    status: EXPENSE_STATUS.ACTIVE
  });

  if (!expense) {
    return this.sendMessage(chatId, NO_ACTIVE_EXPENSE_TEXT, { parse_mode: 'Markdown' });
  }
}
