import mongoose from 'mongoose';
import Expense from '../models/Expense';
import User from '../models/User';

import constants from '../constants';
const { EXPENSE_REPLY_MARKUP } = constants;

const { Types: { ObjectId: { isValid } } } = mongoose;

export default async function(msg) {
  const {
    id: inline_query_id,
    query: expenseId,
    from: {
      id: userId
    }
  } = msg;

  if (isValid(expenseId)) {
    const expense = await Expense.findById(expenseId);
    const user = await User.findOne({ telegramId: userId });

    this.answerInlineQuery(inline_query_id, [{
      type: 'article',
      id: expenseId,
      title: `Title: ${expense.title}. Amount: ${expense.amount}`,
      input_message_content: {
        parse_mode: 'Markdown',
        message_text: expense.getMessageText(EXPENSE_REPLY_MARKUP.DETAILS, { user })
      },
      reply_markup: expense.getReplyMarkup(EXPENSE_REPLY_MARKUP.DETAILS)
    }], {
      cache_time: 1
    });
  } else {
    this.answerInlineQuery(inline_query_id, [{
      type: 'article',
      id: expenseId,
      title: 'invalid',
      input_message_content: {
        parse_mode: 'Markdown',
        message_text: 'test text'
      }
    }], {
      cache_time: 1
    });
  }
}
