require("dotenv").config();
const mongoose = require("mongoose");
const DATABASE_URL = process.env.DATABASE_URL;

const connectWithDatabase = () => {
  mongoose
    .connect(DATABASE_URL)
    .then(() => {
      console.log("Connection with database successful");
    })
    .catch((err) => {
      console.log("Error connecting with database ", err);
    });
};

module.exports = connectWithDatabase;
