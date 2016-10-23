import expect from 'expect.js';
import User from '../models/User';
import Debtor from '../models/Debtor';
import Expense from '../models/Expense';
import Chat from '../models/Chat';

import constants from '../constants';

const { DEBTOR_STATUS } = constants;

const data = {
  user: {
    telegramId: 162924,
    firstName: 'Sergey',
    lastName: 'Vayser',
    username: 'goodman'
  },
  expense: {
    title: 'party-title',
    amount: 200,
    status: 'active',
    debtors: [],
    notes: []
  },
  chat: {
    title: 'Expense BOT test group',
    type: 'group',
    telegramId: -162982610
  }
};

export async function getUser(override = {}) {
  return await User.create({ ...data.user, ...override });
}

export async function getExpense(override = {}) {
  const expense = await Expense.create({
    ...data.expense,
    chat: override.chat || (await Chat.create(data.chat)).get('id'),
    host: override.user || (await User.create(data.user)).get('id')
  });

  return expense;
}

export async function getDebtor(override) {
  const debtor = await Debtor.create({
    user: override.user || (await getUser()).get('id'),
    expense: override.expense || (await getExpense()).get('id'),
    status: DEBTOR_STATUS.ACTIVE
  });

  return debtor;
}

export function getTestMessageJSON(text, override) {
  return {
    text,
    message_id: 87,
    from:
     { id: 162924,
       first_name: 'Sergey',
       last_name: 'Vayser',
       username: 'goodman' },
    chat:
     { id: -162982610,
       title: 'Expense BOT test group',
       type: 'group',
       all_members_are_administrators: true },
    date: 1476007995,
    entities: [{ type: 'bot_command', offset: 0, length: 5 }],
    ...override
  };
}

export function getSendMessageAssertion(expectedResponseText) {
  return function(chatId, responseText) {
    expect(responseText).to.be.eql(expectedResponseText);
  };
}
