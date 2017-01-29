import constantMirror from 'constant-mirror';

export default {
  INIT_COMMAND_PATTERN: /\/init/,
  OK_COMMAND_PATTERN: /^\/ok$/,
  OUT_COMMAND_PATTERN: /^\/out$/,
  COMMIT_COMMAND_PATTERN: /^\/commit$/,
  EXPENSE_REPLY_MARKUP: constantMirror('DETAILS'),
  EXPENSE_STATUS: {
    ACTIVE: 'active',
    COMMITED: 'commited',
    CANCELED: 'canceled'
  },
  DEBTOR_STATUS: {
    ACTIVE: 'active',
    CLOSED: 'closed',
    OUT: 'out'
  }
};
