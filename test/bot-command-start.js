import expect from 'expect.js';
import constants from '../constants';

import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';

const {
  START_COMMAND_PATTERN,
  EXPENSE_FLOW_PHASES
} = constants;

import start from '../chat-commands/start';

import { getTestMessageJSON, getSendMessageAssertion, getExpense, getUser } from './utils';

describe('COMMAND: /start', () => {
  beforeEach(async () => {
    await Chat.remove();
    await User.remove();
    await Expense.remove();
  });

  describe('when run command', () => {
    describe('with draft expense in backpack', () => {
      it('should ask to specify amount', async () => {
        const user = await getUser();
        const expense = await getExpense({ user: user.get('id') });

        user.set({
          createExpenseFlowStatus: EXPENSE_FLOW_PHASES.WAITING_FOR_AMOUNT,
          incompletedExpense: expense.get('id')
        });

        await user.save();

        const msg = getTestMessageJSON('/start');
        const sendMessage = getSendMessageAssertion('Please specify amount');
        await start.bind({ sendMessage })(msg, msg.text.match(START_COMMAND_PATTERN));
      });

      it('should ask to specify title', async () => {
        const user = await getUser();
        const expense = await getExpense({ user: user.get('id') });

        user.set({
          createExpenseFlowStatus: EXPENSE_FLOW_PHASES.WAITING_FOR_TITLE,
          incompletedExpense: expense.get('id')
        });

        await user.save();

        const msg = getTestMessageJSON('/start');
        const sendMessage = getSendMessageAssertion('Please specify title');
        await start.bind({ sendMessage })(msg, msg.text.match(START_COMMAND_PATTERN));
      });
    });

    describe('whithout draft expense in backpack', () => {
      it('should create expense and ask to specify amount', async () => {
        const msg = getTestMessageJSON('/start');
        const sendMessage = getSendMessageAssertion('Expense was creaated, please specify amount');
        await start.bind({ sendMessage })(msg, msg.text.match(START_COMMAND_PATTERN));

        const expenses = await Expense.find({});

        expect(expenses).to.have.property('length', 1);
      });
    });
  });
});
