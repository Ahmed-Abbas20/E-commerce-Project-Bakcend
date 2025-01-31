const mongoose = require("mongoose");

const connectToMongo = async (url, callback) => {
  try {
    await mongoose.connect(url);
    process.nextTick(() => {
      callback();
    });
  } catch (error) {
    console.log(error?.message);
    throw new Error("Internal server error, can't connect to mongodb");
  }
};

module.exports.DATA_BASE = {
  connectToMongo,
};
