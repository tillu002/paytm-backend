const mongoose = require("mongoose");
const { date } = require("zod");

async function connect() {
  try {
    const con = await mongoose.connect(
      "mongodb+srv://pavantillu2729:C19PyN4ti4sTENGi@cluster0.yccsrrh.mongodb.net/Paytm"
    );
    if (con) {
      console.log("DB connected successfully");
    }
  } catch (e) {
    console.log("Connecting to DB again");
    mongoose.connect(
      "mongodb+srv://pavantillu2729:C19PyN4ti4sTENGi@cluster0.yccsrrh.mongodb.net/Paytm"
    );
  }
}

connect();

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  transactionSchema: Object,
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const transactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "Account",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  time: {
    type: String,
    default: Date.now(),
  },
  to: {
    type: String,
    required: true,
  },
});

const Account = mongoose.model("Account", accountSchema);
const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionSchema
);
const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  Account,
  TransactionHistory,
};
