import config from 'config';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

console.log(config);
mongoose.connect(config.get('db.connection'));
// mongoose.set('debug', true);

mongoose.connection.on('connected', () => {
  console.log(`Connected to ${config.get('db.connection')}`);
});

mongoose.connection.on('disconnected', () => {
  console.log(`Disconnected from ${config.get('db.connection')}`);
});

mongoose.connection.on('close', () => {
  console.log(`Close ${config.get('db.connection')}`);
});

mongoose.connection.on('reconnected', () => {
  console.log(`Reconnected to ${config.get('db.connection')}`);
});

mongoose.connection.on('error', e => {
  console.log(e);
});
