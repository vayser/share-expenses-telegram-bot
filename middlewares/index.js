import Expense from '../models/Expense';
import Chat from '../models/Chat';
import User from '../models/User';

export function chain(msg, match) {
  const that = this;
  const data = {};
  return async function(...args) {
    return new Promise((resolve, reject) => {
      function iter(...args) {
        const fn = args.shift();

        if (!fn) {
          return resolve();
        }

        fn.call(that, msg, match, data, breakChain => {
          if (breakChain) {
            return resolve();
          }
          iter.apply(that, args);
        });
      }

      iter.apply(that, args);
    });
  };
}

export async function getChat(msg, match, data, next) {
  const {
    chat: {
      id: chatId,
      title: chatTitle,
      type: chatType
    }
  } = msg;

  const chat = await Chat.findOrCreate({ telegramId: chatId }, {
    title: chatTitle,
    type: chatType,
    telegramId: chatId
  });

  data.chat = chat;
  next();
}
export async function getUser(msg, match, data, next) {
  const {
    from: {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username
    }
  } = msg;

  const user = await User.findOrCreate({ telegramId: userId }, {
    telegramId: userId,
    firstName,
    lastName,
    username
  });

  data.user = user;
  next();
}

export async function getActiveExpense(msg, match, data, next) {
  const {
    chat: {
      id: chatId
    }
  } = msg;

  const activeExpense = await Expense.getActiveExpense({ chatId });

  data.activeExpense = activeExpense;

  next();
}
