import expect from 'expect.js';

export function getTestMessageJSON(text, override) {
  return {
    text,
    message_id: 87,
    from:
     { id: 162924,
       first_name: 'Sergey',
       last_name: 'Vayser',
       username: 'goodman' },
    chat:
     { id: -162982610,
       title: 'Expense BOT test group',
       type: 'group',
       all_members_are_administrators: true },
    date: 1476007995,
    entities: [{ type: 'bot_command', offset: 0, length: 5 }],
    ...override
  };
}

export function getSendMessageAssertion(expectedResponseText) {
  return function(chatId, responseText) {
    expect(responseText).to.be.eql(expectedResponseText);
  };
}
