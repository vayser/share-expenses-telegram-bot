import { deferConfig as _ } from 'config/defer';

module.exports = {
  botToken: '275279123:AAG4rOm6f9ljo3gqGw2QKBgfrYGiouNgKfc',
  db: {
    name: 'track-expenses-bot',
    connection: _(cfg => `mongodb://mongo/${cfg.db.name}`)
  }
};
