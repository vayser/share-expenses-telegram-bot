import Expense from '../models/Expense';
import { chain, getChat, getUser } from '../middlewares';

import constants from '../constants';
const { EXPENSE_FLOW_PHASES, EXPENSE_STATUS } = constants;

export default async function handleInit(msg, data) {
  await chain.call(this, msg, data)(
    getChat,
    getUser,
    async (msg, data, next) => {
      const {
        chat: { id: chatId }
      } = msg;

      const { user, chat } = data;

      if (user.incompletedExpense) {
        if (user.createExpenseFlowStatus === EXPENSE_FLOW_PHASES.WAITING_FOR_AMOUNT) {
          this.sendMessage(chatId, 'Please specify amount');
        }

        if (user.createExpenseFlowStatus === EXPENSE_FLOW_PHASES.WAITING_FOR_TITLE) {
          this.sendMessage(chatId, 'Please specify title');
        }
      }

      if (!user.createExpenseFlowStatus || user.createExpenseFlowStatus === EXPENSE_FLOW_PHASES.READY) {
        const expense = await Expense.create({
          host: user.get('id'),
          chat: chat.get('id'),
          status: EXPENSE_STATUS.ACTIVE
        });

        user.set({
          createExpenseFlowStatus: EXPENSE_FLOW_PHASES.WAITING_FOR_AMOUNT,
          incompletedExpense: expense.get('id')
        });

        await user.save();

        this.sendMessage(chatId, 'Expense was creaated, please specify amount');
      }

      next();
    }
  );
}
