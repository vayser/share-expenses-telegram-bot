import expect from 'expect.js';
import constants from '../constants';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';
import Debtor from '../models/Debtor';

const {
  INIT_COMMAND_PATTERN,
  OK_COMMAND_PATTERN,
  DEBTOR_STATUS
} = constants;

import init from '../chat-commands/init';
import ok from '../chat-commands/ok';
import { getTestMessageJSON, getSendMessageAssertion } from './utils';

describe('COMMAND: /ok', () => {
  beforeEach(async () => {
    await Chat.remove();
    await User.remove();
    await Expense.remove();
    await Debtor.remove();
  });
  describe('when there are no expenses', () => {
    it('should return error message', async () => {
      const msg = getTestMessageJSON('/ok');
      const sendMessage = getSendMessageAssertion('`ERROR`: @goodman, there are no active expenses in chat');
      await ok.bind({ sendMessage })(msg, msg.text.match(OK_COMMAND_PATTERN));
    });
  });
  describe('when there is active expenses', () => {
    it('should create debtor with active status and add him to expense debtors', async () => {
      const initMsg = getTestMessageJSON('/init 200 party-title');
      await init.bind({ sendMessage: () => {} })(initMsg, initMsg.text.match(INIT_COMMAND_PATTERN));
      const okMsg = getTestMessageJSON('/ok');
      await ok.bind({ sendMessage: () => {} })(okMsg, okMsg.text.match(OK_COMMAND_PATTERN));

      const debtor = await Debtor.findOne();
      expect(debtor).to.have.property('status', DEBTOR_STATUS.ACTIVE);

      const expense = await Expense.findOne();
      expect(expense.debtors).to.have.property('length', 1);
      expect(expense.debtors[0].toString() === debtor.get('id').toString()).to.be.ok();
    });
  });
});
