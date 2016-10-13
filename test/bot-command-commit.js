import expect from 'expect.js';
import constants from '../constants';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';

const {
  INIT_COMMAND_PATTERN,
  SUBMIT_COMMAND_PATTERN,
  EXPENSE_STATUS
} = constants;

import init from '../chat-commands/init';
import ok from '../chat-commands/ok';
import commit from '../chat-commands/commit';
import { getTestMessageJSON, getSendMessageAssertion } from './utils';

describe('COMMAND: /commit', () => {
  beforeEach(async () => {
    await Chat.remove();
    await User.remove();
    await Expense.remove();
  });
  describe('when there are no expenses', () => {
    it('should return error message', async () => {
      const msg = getTestMessageJSON('/commit');
      const sendMessage = getSendMessageAssertion('`ERROR`: @goodman, there are no active expenses in chat');
      await ok.bind({ sendMessage })(msg, msg.text.match(SUBMIT_COMMAND_PATTERN));
    });
  });

  describe('when there are active expense', () => {
    it('should return error if commiter is not owner and did not change status', async () => {
      const initMessage = getTestMessageJSON('/init 200 toosa');
      const submitMessage = getTestMessageJSON('/commit', { from: { username: 'wice', id: Math.random() } });
      const sendMessage = getSendMessageAssertion('`ERROR`: @wice, is not owner of toosa expense');
      await init.bind({ sendMessage: () => {} })(initMessage, initMessage.text.match(INIT_COMMAND_PATTERN));
      await commit.bind({ sendMessage })(submitMessage, submitMessage.text.match(INIT_COMMAND_PATTERN));
      const expense = await Expense.findOne();
      expect(expense.status).to.be.eql(EXPENSE_STATUS.ACTIVE);
    });

    it('should return success message and change expense status', async () => {
      const initMessage = getTestMessageJSON('/init 200 toosa');
      const submitMessage = getTestMessageJSON('/commit');
      const sendMessage = getSendMessageAssertion('@goodman commited *toosa* expense with amount *200*');
      await init.bind({ sendMessage: () => {} })(initMessage, initMessage.text.match(INIT_COMMAND_PATTERN));
      await commit.bind({ sendMessage })(submitMessage, submitMessage.text.match(INIT_COMMAND_PATTERN));
      const expense = await Expense.findOne();
      expect(expense.status).to.be.eql(EXPENSE_STATUS.COMMITED);
    });
  });
});
