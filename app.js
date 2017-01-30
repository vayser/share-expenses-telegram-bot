import TelegramBot from 'node-telegram-bot-api';
import PrettyError from 'pretty-error';
import config from 'config';
import init from './chat-commands/init';
import ok from './chat-commands/ok';
import out from './chat-commands/out';
import commit from './chat-commands/commit';
import repay from './chat-commands/repay';
import unrepay from './chat-commands/unrepay';

import constants from './constants';
import './db';

const pe = new PrettyError();

const bot = new TelegramBot(config.get('botToken'), { polling: true });

const {
  INIT_COMMAND_PATTERN
} = constants;

function matcher(pattern, handler) {
  bot.onText(pattern, async (msg, match) => {
    try {
      await handler.call(bot, msg);
    } catch (e) {
      console.log(pe.render(e));
    }
  });
}

matcher(INIT_COMMAND_PATTERN, init);

bot.on('callback_query', async query => {
  const commands = { init, ok, out, commit, repay, unrepay };

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
    await commands[data.command].apply(bot, [{
      ...query.message,
      callbackFrom: query.from,
      queryId: query.id
    }, data]);
  } catch (e) {
    console.log(pe.render(e));
  }
});
