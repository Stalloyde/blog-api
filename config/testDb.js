const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function testMongoDb() {
  const testMongoDb = await MongoMemoryServer.create();
  const mongoUri = testMongoDb.getUri();

  async function initializeConnection() {
    mongoose.connect(mongoUri);

    mongoose.connection.on('error', (e) => {
      if (e.message.code === 'ETIMEDOUT') {
        console.log(e);
        mongoose.connect(mongoUri);
      }
      console.log(e);
    });

    mongoose.connection.on('open', () => {
      console.log(`MongoDB successfully connected to ${mongoUri}`);
    });
  }

  async function stopConnection() {
    await testMongoDb.stop();
    console.log(`MongoDB successfully disconnected from ${mongoUri}`);
  }

  return { initializeConnection, stopConnection };
}

module.exports = testMongoDb;
