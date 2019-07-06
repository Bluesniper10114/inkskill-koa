const faker = require('faker');
const Subscription = require('../../models/Subscription');

const emails = [
  'tester@inkskill.com',
  'startrek@inkskill.com',
  'predator@inkskill.com'
];

module.exports = async function () {
  await Subscription.remove({ email: { $in: emails } });

  // create subscriptions
  for (let email of emails) {
    try {
      let subscription= new Subscription({
        email: email,
        createdAt: faker.date.past(),
      });

      subscription = await subscription.save();
    } catch (e) {
      console.log('error', e.message);
    }
  }

  console.log('Seed subscriptions: done');
};
