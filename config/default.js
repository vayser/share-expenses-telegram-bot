import { deferConfig as _ } from 'config/defer';

module.exports = {
  host: '127.0.0.1',
  botToken: '291639113:AAHCNHwn_oqcctAi-L9YpZcNQADGaTDmlo8',
  db: {
    host: '127.0.0.1',
    port: '27017',
    name: 'track-expenses-bot',
    connection: _(cfg => `mongodb://${cfg.db.host}:${cfg.db.port}/${cfg.db.name}`)
  }
};
