const express = require("express");
const { User, Account, TransactionHistory } = require("../DB");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");
const { JWT_SECRET } = require("../config");
const dateOptions = {
  timeZone: "Asia/Kolkata",
  hour12: false,
};

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });
  const user = await User.findOne({
    _id: req.userId,
  });
  res.json({
    balance: account.balance,
    username: user.firstName,
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  let retries = 2;
  let success = false;
  while (!success && retries > 0) {
    const sessionTransaction = await mongoose.startSession();

    sessionTransaction.startTransaction();
    const { amount, to } = req.body;

    //Here we are fethching accounts within in thee trnsaction
    const account = await Account.findOne({ userId: req.userId }).session(
      sessionTransaction
    );

    if (!account) {
      await sessionTransaction.abortTransaction();
      return res.status(400).json({
        message: "Account doesn't exist",
      });
    }

    if (account.balance < amount) {
      await sessionTransaction.abortTransaction();
      return res.status(403).json({ message: "Insufficient Balance" });
    }

    const toAccount = await Account.findOne({ userId: to });

    if (!toAccount) {
      await sessionTransaction.abortTransaction();
      return res.status(400).json({
        message: "Invalid account details/account doesn't exist",
      });
    }

    try {
      if (account.balance > amount) {
        await Account.updateOne(
          { userId: req.userId },
          { $inc: { balance: -amount } }
        ).session(sessionTransaction);

        await Account.updateOne(
          { userId: to },
          { $inc: { balance: amount } }
        ).session(sessionTransaction);
      }

      const istDate = new Date().toLocaleString("en-IN", dateOptions);

      await TransactionHistory.create({
        accountId: account._id,
        amount: amount,
        time: istDate,
        to: to,
      });

      await sessionTransaction.commitTransaction();
      success = true;
      const final = { message: "Transaction Successful" };
      if (success) {
        return res.status(200).json(final);
      }
    } catch (e) {
      retries--;
      const final = {
        message: "Something went wrong/ Insufficient funds -> Error: " + e,
      };
      return res.status(403).json(final);
    } finally {
      sessionTransaction.endSession(sessionTransaction);
    }
  }
});
module.exports = router;
