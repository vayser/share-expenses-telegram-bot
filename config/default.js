import { deferConfig as _ } from 'config/defer';

module.exports = {
  host: '127.0.0.1',
  botToken: '275279123:AAG4rOm6f9ljo3gqGw2QKBgfrYGiouNgKfc',
  db: {
    host: 'localhost',
    port: '27017',
    name: 'track-expenses-bot',
    connection: _(cfg => `mongodb://${cfg.db.host}:${cfg.db.port}/${cfg.db.name}`)
  }
};
