import { deferConfig as _ } from 'config/defer';

module.exports = {
  host: '127.0.0.1',
  botToken: '229399099:AAEWRMyjSu8-zEIrThgzoUgwB0wAdNC7gEU',
  db: {
    host: '127.0.0.1',
    port: '27017',
    name: 'track-expenses-bot',
    connection: _(cfg => `mongodb://${cfg.db.host}:${cfg.db.port}/${cfg.db.name}`)
  }
};
