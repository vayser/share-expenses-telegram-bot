import { deferConfig as _ } from 'config/defer';

module.exports = {
  host: '127.0.0.1',
  botToken: '229399099:AAEWRMyjSu8-zEIrThgzoUgwB0wAdNC7gEU',
  db: {
    host: 'ds139939.mlab.com',
    port: '39939',
    name: 'track-expenses-bot',
    user: 'wice',
    password: 'qQ190391',
    connection: _(cfg => `mongodb://${cfg.db.user}:${cfg.db.password}@${cfg.db.host}:${cfg.db.port}/${cfg.db.name}`)
  }
};
