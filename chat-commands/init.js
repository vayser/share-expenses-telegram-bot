import Expense from '../models/Expense';
import { chain, getChat, getUser } from '../middlewares';

import constants from '../constants';
const { EXPENSE_STATUS, EXPENSE_REPLY_MARKUP } = constants;

function validateArguments(msg, data, next) {
  const {
    text,
    chat: { id: chatId },
    from: { username }
  } = msg;

  const INVALID_COMMAND_TEXT = `\`ERROR\`: @${username}, please, specify correct *amount* and *title*: /init {amount} {title}`;

  const matched = text.match(/init\s([\d\.]+)\s(.+)/);

  if (!matched) {
    this.sendMessage(chatId, INVALID_COMMAND_TEXT, { parse_mode: 'Markdown' });
    return next(true);
  }

  const [, amount, title] = matched;
  data.args = { amount, title };
  next();
}

export default async function handleInit(msg, data) {
  await chain.call(this, msg, data)(
    validateArguments,
    getChat,
    getUser,
    async (msg, data, next) => {
      const {
        chat: { id: chatId }
      } = msg;

      const { user, chat, args: { title, amount } } = data;

      const expense = await Expense.create({
        host: user.get('id'),
        chat: chat.get('id'),
        title,
        amount,
        status: EXPENSE_STATUS.ACTIVE
      });

      this.sendMessage(chatId, expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS, { user }), {
        parse_mode: 'Markdown',
        reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
      });

      next();
    }
  );
}
