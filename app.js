// import TelegramBot from 'node-telegram-bot-api';
import config from 'config';
import init from './chat-commands/init';
import ok from './chat-commands/ok';
import out from './chat-commands/out';
import commit from './chat-commands/commit';

import constants from './constants';
import './db';

// const bot = new TelegramBot(config.get('botToken'), { polling: true });

const {
  INIT_COMMAND_PATTERN,
  OK_COMMAND_PATTERN,
  OUT_COMMAND_PATTERN,
  COMMIT_COMMAND_PATTERN
} = constants;

// bot.onText(INIT_COMMAND_PATTERN, init.bind(bot));
// bot.onText(OK_COMMAND_PATTERN, ok.bind(bot));
// bot.onText(OUT_COMMAND_PATTERN, out.bind(bot));
// bot.onText(COMMIT_COMMAND_PATTERN, commit.bind(bot));
