import Expense from '../models/Expense';
import Debtor from '../models/Debtor';
import Chat from '../models/Chat';
import User from '../models/User';

export function chain(request, data = {}) {
  const that = this;
  return async function(...args) {
    return new Promise(async (resolve, reject) => {
      async function iter(...args) {
        const fn = args.shift();

        if (!fn) {
          return resolve();
        }

        try {
          await fn.call(that, request, data, async breakChain => {
            if (breakChain) {
              return resolve();
            }
            await iter.apply(that, args);
          });
        } catch (e) {
          reject(e);
        }
      }

      await iter.apply(that, args);
    });
  };
}

export async function privateOnly(msg, data, next) {
  if (msg.chat.type !== 'private') {
    return next(true);
  }

  next();
}

export async function getChat(msg, data, next) {
  if (!msg.chat) {
    return next();
  }

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

export async function getDebtor(msg, data, next) {
  const { debtorId } = data;
  data.debtor = await Debtor.findById(debtorId);
  next();
}

export async function getExpense(msg, data, next) {
  const { expenseId, debtorId } = data;
  if (expenseId) {
    data.expense = await Expense.findById(expenseId);
  } else {
    data.expense = await Expense.findOne({ debtors: debtorId });
  }
  next();
}

export async function callbackGetChat(query, data, next) {
  // skip inline query. This query does not have chat info
  if (query.inline_message_id) {
    return next();
  }

  const {
    message: {
      chat: {
        id: chatId,
        title: chatTitle,
        type: chatType
      }
    }
  } = query;

  const chat = await Chat.findOrCreate({ telegramId: chatId }, {
    title: chatTitle,
    type: chatType,
    telegramId: chatId
  });

  data.chat = chat;
  next();
}

export async function callbackGetUser(query, data, next) {
  const {
    from: {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username
    }
  } = query;

  const user = await User.findOrCreate({ telegramId: userId }, {
    telegramId: userId,
    firstName,
    lastName,
    username
  });

  data.user = user;
  next();
}

export async function getUser(msg, data, next) {
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
