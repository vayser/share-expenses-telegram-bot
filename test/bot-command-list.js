import expect from 'expect.js';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';

import list from '../chat-commands/list';

import { getTestMessageJSON, getExpense, getUser } from './utils';

describe.only('COMMAND: /list', () => {
  beforeEach(async () => {
    await Chat.remove();
    await User.remove();
    await Expense.remove();
  });

  describe('when run command', () => {
    it('should return list of expenses', async () => {
      const user = await getUser();
      await getExpense({ user: user.get('id') });
      await getExpense({ user: user.get('id') });

      const msg = getTestMessageJSON('/list');

      const sendMessage = (chatId, msg, options) => {
        expect(msg).to.be.eql('List of your expenses');
      };

      await list.bind({ sendMessage })(msg, {});
    });
  });
});
