import constantMirror from 'constant-mirror';

export default {
  START_COMMAND_PATTERN: /\/start/,
  LIST_COMMAND_PATTERN: /^\/list$/,
  CREATE_FLOW_COMMAND_PATTERN: new RegExp(`^((?!/start)(?!/list)(?!/init).)*$`),
  EXPENSE_REPLY_MARKUP: constantMirror('DETAILS', 'LIST'),
  EXPENSE_STATUS: {
    ACTIVE: 'active',
    COMMITED: 'commited',
    CANCELED: 'canceled'
  },
  DEBTOR_STATUS: constantMirror('UNREPAID', 'REPAID'),
  EXPENSE_FLOW_PHASES: constantMirror('READY', 'WAITING_FOR_AMOUNT', 'WAITING_FOR_TITLE')
};
