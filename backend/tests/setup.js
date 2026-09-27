const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

// A single-node replica set (not a plain MongoMemoryServer) because
// addExpense/updateUserExpense/deleteUserExpense run mongoose transactions,
// which MongoDB only supports on a replica set.
let replset;

async function connect() {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replset.getUri());
}

async function clearDatabase() {
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await replset.stop();
}

module.exports = { connect, clearDatabase, closeDatabase };
