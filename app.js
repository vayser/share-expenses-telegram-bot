import TelegramBot from 'node-telegram-bot-api';
import PrettyError from 'pretty-error';
import config from 'config';
import init from './chat-commands/init';
import createExpenseFlow from './chat-commands/create-expense-flow';
import start from './chat-commands/start';
import list from './chat-commands/list';
import open from './chat-commands/open';
import ok from './chat-commands/ok';
import remove from './chat-commands/remove';
import lock from './chat-commands/lock';
import unlock from './chat-commands/unlock';
import out from './chat-commands/out';
import repay from './chat-commands/repay';
import unrepay from './chat-commands/unrepay';
import inlineQuery from './chat-commands/inline-query';

import constants from './constants';
import './db';

const pe = new PrettyError();

const bot = new TelegramBot(config.get('botToken'), { polling: true });

const {
  INIT_COMMAND_PATTERN,
  LIST_COMMAND_PATTERN,
  START_COMMAND_PATTERN
} = constants;

function matcher(pattern, handler) {
  bot.onText(pattern, async (msg, match) => {
    try {
      if (msg.aborted) {
        return;
      }

      await handler.call(bot, msg, {}, match);
    } catch (e) {
      console.log(pe.render(e));
    }
  });
}

matcher(INIT_COMMAND_PATTERN, init);
matcher(LIST_COMMAND_PATTERN, list);
matcher(START_COMMAND_PATTERN, start);
matcher(new RegExp(`^((?!/start)(?!/list)(?!/init).)*$`), createExpenseFlow);

bot.on('inline_query', async msg => {
  try {
    await inlineQuery.call(bot, msg);
  } catch (e) {
    console.log(pe.render(e));
  }
});

bot.on('callback_query', async query => {
  const commands = { ok, out, repay, unrepay, open, remove, lock, unlock };

  let { data } = query;

  try {
    data = JSON.parse(data);
  } catch (e) {
    data = {};
  }

  if (!data.command || !commands[data.command]) {
    return;
  }

  try {
    await commands[data.command].apply(bot, [query, data]);
  } catch (e) {
    console.log(pe.render(e));
  }
});
