import expect from 'expect.js';
import constants from '../constants';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';

const {
  INIT_COMMAND_PATTERN,
  OK_COMMAND_PATTERN
} = constants;

import init from '../chat-commands/init';
import ok from '../chat-commands/ok';
import { getTestMessageJSON, getSendMessageAssertion } from './utils';

describe('COMMAND: /ok', () => {
  describe('when there are no expenses', () => {
    it('should return error message', async () => {
      const msg = getTestMessageJSON('/ok');
      const sendMessage = getSendMessageAssertion('`ERROR`: @goodman, there are no active expenses in chat');
      await ok.bind({ sendMessage })(msg, msg.text.match(OK_COMMAND_PATTERN));
    });
  });
});
