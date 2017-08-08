import expect from 'expect.js';

import Expense from '../models/Expense';
import Debtor from '../models/Debtor';
import User from '../models/User';

import { getExpense, getDebtor } from './utils';

describe('Expense', () => {
  beforeEach(async () => {
    await Expense.remove();
    await Debtor.remove();
    await User.remove();
  });

  describe('when #getPersonalCredit', () => {
    it('should return total amount splited between all debtors', async () => {
      const expense = await getExpense();
      const debtor1 = await getDebtor({ expense: expense.get('id') });
      const debtor2 = await getDebtor({ expense: expense.get('id') });
      expense.debtors.push(debtor1);
      expense.debtors.push(debtor2);
      expect(expense.getPersonalCredit()).to.be.eql(100);
    });
  });
});
