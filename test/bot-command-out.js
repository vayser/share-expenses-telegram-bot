import expect from 'expect.js';
import constants from '../constants';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';
import Debtor from '../models/Debtor';

const {
  INIT_COMMAND_PATTERN,
  OK_COMMAND_PATTERN,
  OUT_COMMAND_PATTERN,
  DEBTOR_STATUS
} = constants;

import init from '../chat-commands/init';
import ok from '../chat-commands/ok';
import out from '../chat-commands/out';
import commit from '../chat-commands/commit';
import { getTestMessageJSON } from './utils';

describe('COMMAND: /out', () => {
  beforeEach(async () => {
    await Chat.remove();
    await User.remove();
    await Expense.remove();
    await Debtor.remove();
  });

  describe('when debtor type out before host commit expense', () => {
    it('should remove debtor from expense and change his status to out', async () => {
      const initMsg = getTestMessageJSON('/init 200 party-title');
      await init.bind({ sendMessage: () => {} })(initMsg, initMsg.text.match(INIT_COMMAND_PATTERN));
      const okMsg = getTestMessageJSON('/ok');
      await ok.bind({ sendMessage: () => {} })(okMsg, okMsg.text.match(OK_COMMAND_PATTERN));
      const outMsg = getTestMessageJSON('/out');
      await out.bind({ sendMessage: () => {} })(outMsg, outMsg.text.match(OUT_COMMAND_PATTERN));

      const debtor = await Debtor.findOne();
      expect(debtor).to.have.property('status', DEBTOR_STATUS.OUT);

      const expense = await Expense.findOne();
      expect(expense.debtors).to.have.property('length', 0);
    });
  });

  describe('when debtor type /out after host commit expense', () => {
    it('should not remove debtor from expense and his status should be active', async () => {
      const initMsg = getTestMessageJSON('/init 200 party-title');
      await init.bind({ sendMessage: () => {} })(initMsg, initMsg.text.match(INIT_COMMAND_PATTERN));

      const okMsg = getTestMessageJSON('/ok');
      await ok.bind({ sendMessage: () => {} })(okMsg, okMsg.text.match(OK_COMMAND_PATTERN));

      const commitMsg = getTestMessageJSON('/commit');
      await commit.bind({ sendMessage: () => {} })(commitMsg, commitMsg.text.match(INIT_COMMAND_PATTERN));

      const outMsg = getTestMessageJSON('/out');
      await out.bind({ sendMessage: () => {} })(outMsg, outMsg.text.match(OUT_COMMAND_PATTERN));

      const debtor = await Debtor.findOne();
      expect(debtor).to.have.property('status', DEBTOR_STATUS.ACTIVE);

      const expense = await Expense.findOne();
      expect(expense.debtors).to.have.property('length', 1);
    });
  });
});
