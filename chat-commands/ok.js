import Chat from '../models/Chat';
import User from '../models/User';
import Debtor from '../models/Debtor';
import Expense from '../models/Expense';
import constants from '../constants';
const { EXPENSE_STATUS, DEBTOR_STATUS } = constants;

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

  const chat = await Chat.findOne({ telegramId: chatId });

  if (!chat) {
    return this.sendMessage(chatId, NO_ACTIVE_EXPENSE_TEXT, { parse_mode: 'Markdown' });
  }

  const expense = await Expense.findOne({
    chat: chat.get('id'),
    status: EXPENSE_STATUS.ACTIVE
  });

  if (!expense) {
    return this.sendMessage(chatId, NO_ACTIVE_EXPENSE_TEXT, { parse_mode: 'Markdown' });
  }

  let SUCCESS_APPLIED_TO_SHARE_EXPENSE = `@${username}, applied to share *${expense.title}* expense with amount *${expense.amount}*`;

  const user = await User.findOrCreate({ telegramId: userId }, {
    telegramId: userId,
    firstName,
    lastName,
    username
  });

  const debtor = await Debtor.create({
    user: user.get('id'),
    expense: expense.get('id'),
    status: DEBTOR_STATUS.ACTIVE
  });

  expense.set('debtors', [
    ...expense.debtors,
    debtor.get('id')
  ]);

  await expense.save();
  SUCCESS_APPLIED_TO_SHARE_EXPENSE += '\r\n\r\nDebtors list:\r\n\r\n' + (await expense.getDebtorsListText());

  this.sendMessage(chatId, SUCCESS_APPLIED_TO_SHARE_EXPENSE, { parse_mode: 'Markdown' });
}
