const faker = require('faker');
const Question = require('../../models/Question');

const artist = '5963250ec8e851adaf576a8f';

module.exports = async function () {
  await Question.remove({ user: artist });

  // create questions
  for (let i = 0; i < 5; i++) {
    try {
      let question= new Question({
        question: faker.lorem.sentence(),
        answer: faker.lorem.sentences(),
        user: artist,
        createdAt: faker.date.past(),
      });

      question = await question.save();
    } catch (e) {
      console.log('error', e.message);
    }
  }

  console.log('Seed questions: done');
};
