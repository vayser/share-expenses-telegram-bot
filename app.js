import TelegramBot from 'node-telegram-bot-api';
import config from 'config';
import init from './chat-commands/init';

import constants from './constants';
import './db';

const bot = new TelegramBot(config.get('botToken'), { polling: true });

const {
  INIT_COMMAND_PATTERN
} = constants;

bot.onText(INIT_COMMAND_PATTERN, init.bind(bot));
