import Expense from '../models/Expense';

export default async function handleOk(msg, match) {
  const {
    chat: {
      id: chatId
    },
    from: {
      id: userId,
      username
    }
  } = msg;

  const NO_ACTIVE_EXPENSE_TEXT = `\`ERROR\`: @${username}, there are no active expenses in chat`;

  const expense = await Expense.getActiveExpense({ chatId });

  if (!expense) {
    return this.sendMessage(chatId, NO_ACTIVE_EXPENSE_TEXT, { parse_mode: 'Markdown' });
  }

  const EXPENSE_COMMITED_TEXT = `@${username} commited *${expense.title}* expense with amount *${expense.amount}*`;
  const IS_NOT_OWNER_TEXT = `\`ERROR\`: @${username}, is not owner of ${expense.title} expense`;

  const isHost = await expense.isHost(userId);

  if (!isHost) {
    return this.sendMessage(chatId, IS_NOT_OWNER_TEXT, { parse_mode: 'Markdown' });
  }

  await expense.commit();

  return this.sendMessage(chatId, EXPENSE_COMMITED_TEXT, { parse_mode: 'Markdown' });
}
