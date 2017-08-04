import Expense from '../models/Expense';
import { chain, getChat, getUser } from '../middlewares';

import constants from '../constants';
const { EXPENSE_FLOW_PHASES, EXPENSE_REPLY_MARKUP } = constants;

export default async function handleInit(msg, data, match) {
  await chain.call(this, msg, data)(
    getChat,
    getUser,
    async (msg, data, next) => {
      const {
        chat: { telegramId: chat_id },
        user
      } = data;

      const { text } = msg;

      if (!user.createExpenseFlowStatus) {
        return;
      }

      if (user.createExpenseFlowStatus === EXPENSE_FLOW_PHASES.READY) {
        return this.sendMessage(chat_id, 'Unknow command. Create expense with /start command or explore /help');
      }

      const expense = await Expense.findById(user.incompletedExpense);

      if (user.createExpenseFlowStatus === EXPENSE_FLOW_PHASES.WAITING_FOR_AMOUNT) {
        if (isNaN(text)) {
          return this.sendMessage(chat_id, 'Amoun is incorrect, please specify again.');
        }

        user.set({ createExpenseFlowStatus: EXPENSE_FLOW_PHASES.WAITING_FOR_TITLE });

        expense.set({ amount: text });
        await expense.save();
        await user.save();
        return this.sendMessage(chat_id, 'Please specify description');
      }

      if (user.createExpenseFlowStatus === EXPENSE_FLOW_PHASES.WAITING_FOR_TITLE) {
        expense.set({ title: text });
        user.set({ createExpenseFlowStatus: EXPENSE_FLOW_PHASES.READY });

        await expense.save();
        await user.save();

        return this.sendMessage(chat_id, expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS, { user }), {
          parse_mode: 'Markdown',
          reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS, { share: true })
        });
      }

      next();
    }
  );
}
