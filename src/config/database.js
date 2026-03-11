//connect server with db

const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully Connected to db");
  } catch (err) {
    console.log(err);
  }
}

module.exports = connectToDB;
