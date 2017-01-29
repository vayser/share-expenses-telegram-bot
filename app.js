import TelegramBot from 'node-telegram-bot-api';
import config from 'config';
import init from './chat-commands/init';
import ok from './chat-commands/ok';
import out from './chat-commands/out';
import commit from './chat-commands/commit';

import constants from './constants';
import './db';

const bot = new TelegramBot(config.get('botToken'), { polling: true });

const {
  INIT_COMMAND_PATTERN,
  OK_COMMAND_PATTERN,
  OUT_COMMAND_PATTERN,
  COMMIT_COMMAND_PATTERN
} = constants;

function matcher(pattern, handler) {
  bot.onText(pattern, (msg, match) => {
    handler.call(bot, msg);
  });
}

matcher(INIT_COMMAND_PATTERN, init);
matcher(OK_COMMAND_PATTERN, ok);
matcher(OUT_COMMAND_PATTERN, out);
matcher(COMMIT_COMMAND_PATTERN, commit);

bot.on('callback_query', query => {
  const commands = { init, ok, out, commit };

  let { data } = query;
  try {
    data = JSON.parse(data);
  } catch (e) {
    data = {};
  }

  if (!data.command || !commands[data.command]) {
    return;
  }

  commands[data.command].apply(bot, [{ ...query.message, callbackFrom: query.from }, data]);
  bot.answerCallbackQuery(query.id, '');
});
