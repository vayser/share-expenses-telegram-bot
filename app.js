import TelegramBot from 'node-telegram-bot-api';
import PrettyError from 'pretty-error';
import config from 'config';

import createExpenseFlow from './chat-commands/create-expense-flow';
import start from './chat-commands/start';
import list from './chat-commands/list';

import open from './callback-queries/open';
import ok from './callback-queries/ok';
import remove from './callback-queries/remove';
import lock from './callback-queries/lock';
import unlock from './callback-queries/unlock';
import out from './callback-queries/out';
import repay from './callback-queries/repay';
import unrepay from './callback-queries/unrepay';

import inlineQuery from './inline-queries/inline-query';

import constants from './constants';
import './db';

const pe = new PrettyError();

const bot = new TelegramBot(config.get('botToken'), { polling: true });

const {
  LIST_COMMAND_PATTERN,
  START_COMMAND_PATTERN,
  CREATE_FLOW_COMMAND_PATTERN
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

matcher(LIST_COMMAND_PATTERN, list);
matcher(START_COMMAND_PATTERN, start);
matcher(CREATE_FLOW_COMMAND_PATTERN, createExpenseFlow);

bot.on('inline_query', async query => {
  try {
    await inlineQuery.call(bot, query);
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
