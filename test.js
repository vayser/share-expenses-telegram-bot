import expect from 'expect.js';
import constants from '../constants';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';

const {
  INIT_COMMAND_PATTERN
} = constants;

import init from '../chat-commands/init';
import { getTestMessageJSON, getSendMessageAssertion } from './utils';

describe('COMMAND: /init', () => {
  describe('when comand has wrong format', () => {
    it('should return error message if amount is not specified', async () => {
      const msg = getTestMessageJSON('/init PartyTitle');
      const sendMessage = getSendMessageAssertion('`ERROR`: @goodman, please, specify correct *amount* and *title*: /init {amount} {title}');
      await init.bind({ sendMessage })(msg, msg.text.match(INIT_COMMAND_PATTERN));
    });

    it('should return error message if title is not specified', async () => {
      const msg = getTestMessageJSON('/init 200');
      const sendMessage = getSendMessageAssertion('`ERROR`: @goodman, please, specify correct *amount* and *title*: /init {amount} {title}');
      await init.bind({ sendMessage })(msg, msg.text.match(INIT_COMMAND_PATTERN));
    });

    it('should return error message if amount is not a number', async () => {
      const msg = getTestMessageJSON('/init 200test test-title');
      const sendMessage = getSendMessageAssertion('`ERROR`: @goodman, please, specify correct *amount* and *title*: /init {amount} {title}');
      await init.bind({ sendMessage })(msg, msg.text.match(INIT_COMMAND_PATTERN));
    });
  });

  describe('when command has correct format', () => {
    beforeEach(async () => {
      await Chat.remove();
      await User.remove();
      await Expense.remove();
    });

    const successMessage = '@goodman created *party-title* expense with amount *200*, participants can share expense by typing /ok /out';
    it('should return error if active expense already exists', async () => {
      const msg = getTestMessageJSON('/init 200 party-title');
      const msg2 = getTestMessageJSON('/init 200 party2-title');
      const sendMessage = getSendMessageAssertion('`ERROR`: Please, commit current expense *party-title* to create new');
      await init.bind({ sendMessage: () => {} })(msg, msg.text.match(INIT_COMMAND_PATTERN));
      await init.bind({ sendMessage })(msg2, msg2.text.match(INIT_COMMAND_PATTERN));
    });

    it('should return success message', async () => {
      const msg = getTestMessageJSON('/init 200 party-title');
      const sendMessage = getSendMessageAssertion(successMessage);
      await init.bind({ sendMessage })(msg, msg.text.match(INIT_COMMAND_PATTERN));
    });

    it('should create expense with correct amount title and other details', async function() {
      const msg = getTestMessageJSON('/init 200 party-title');
      const sendMessage = getSendMessageAssertion(successMessage);
      await init.bind({ sendMessage })(msg, msg.text.match(INIT_COMMAND_PATTERN));
      const expense = await Expense.findOne();
      expect(expense).to.have.property('amount', 200);
      expect(expense).to.have.property('title', 'party-title');
    });
  });
});
