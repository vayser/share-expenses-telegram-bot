import isFinite from 'lodash.isfinite';
import Chat from '../models/Chat';
import User from '../models/User';
import Expense from '../models/Expense';

export default async function handleInit(msg, match) {
  try {
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

    const INVALID_COMMAND_TEXT = `\`ERROR\`: @${username}, please, specify correct *amount* and *title*: /init {amount} {title}`;

    const matched = text.match(/init\s([\d\.]+)\s(.+)/);

    if (!matched) {
      return this.sendMessage(chatId, INVALID_COMMAND_TEXT, { parse_mode: 'Markdown' });
    }

    const [, amount, title] = matched;

    const DUBLICATED_EXPENSE_TITLE = `\`ERROR\`: @${username}, expense with such name *${title}* already exists, `;
    const EXPENSE_CREATED_TEXT = `@${username} created *${title}* expense with amount *${amount}*, participants can share expense by typing /in /out`;

    const chat = await Chat.findOrCreate({ telegramId: chatId }, {
      title: chatTitle,
      type: chatType,
      telegramId: chatId
    });

    const host = await User.findOrCreate({ telegramId: userId }, {
      telegramId: userId,
      firstName,
      lastName,
      username
    });

    const expense = await Expense.findOne({ title, chat: chat.get('id') });

    if (expense) {
      return this.sendMessage(chatId, DUBLICATED_EXPENSE_TITLE, { parse_mode: 'Markdown' });
    }

    await Expense.create({
      host: host.get('id'),
      chat: chat.get('id'),
      title,
      amount
    });

    this.sendMessage(chatId, EXPENSE_CREATED_TEXT, { parse_mode: 'Markdown' });
  } catch (e) {
    console.log(e);
  }
}