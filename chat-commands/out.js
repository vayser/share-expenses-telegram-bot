import Chat from '../models/Chat';
import User from '../models/User';
import Debtor from '../models/Debtor';
import Expense from '../models/Expense';
import constants from '../constants';
const { EXPENSE_STATUS, DEBTOR_STATUS } = constants;

export default async function handleOut(msg, match) {
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

  const chat = await Chat.findOne({ telegramId: chatId });

  if (!chat) {
    return;
  }

  const expense = await Expense.findOne({
    chat: chat.get('id'),
    status: EXPENSE_STATUS.ACTIVE
  });

  if (!expense) {
    return;
  }

  let SUCCESS_LEAVE_EXPENSE = `@${username}, leave *${expense.title}* expense with amount *${expense.amount}*`;

  const user = await User.findOrCreate({ telegramId: userId }, {
    telegramId: userId,
    firstName,
    lastName,
    username
  });

  const debtor = await Debtor.findOne({
    user: user.get('id'),
    expense: expense.get('id'),
    status: DEBTOR_STATUS.ACTIVE
  });

  if (!debtor) {
    return;
  }

  // expense.removeDebtor(debtor);
  expense.debtors = expense.debtors.filter(d => {
    return d.toString() !== debtor.get('id').toString();
  });

  debtor.set('status', DEBTOR_STATUS.OUT);

  await debtor.save();
  await expense.save();

  SUCCESS_LEAVE_EXPENSE += '\r\n\r\nDebtors list:\r\n\r\n' + (await getDebtorsList(expense));

  this.sendMessage(chatId, SUCCESS_LEAVE_EXPENSE, { parse_mode: 'Markdown' });
}

function getDebtourCredit(expense) {
  return Math.round(expense.amount / (expense.debtors.length + 1));
}

async function getDebtorsList(expense) {
  const debtors = await Debtor.find({ _id: { $in: expense.debtors } }).populate('user');
  return debtors.map(d => (`${d.user.firstName} @${d.user.username} ${d.user.lastName} - *${getDebtourCredit(expense, d)}*`)).join('\r\n');
}
