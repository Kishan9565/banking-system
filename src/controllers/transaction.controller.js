const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');


/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW
 *  1. Validate the request
 *  2. Validate the idempotency key
 *  3. Check account status
 *  4. Derive sender balance form ledger
 *  5. Create transaction (PENDING)
 *  6. Create DEBIT ledger entry
 *  7. Create CREDIT ledger entry
 *  8. Mark transaction COMPLETED
 *  9. Commit MongoDB session
 *  10. Send email notification
 */

async function createTransaction(req, res) {

      /**
       * 1. Validate the request
       * - fromAccount, toAccount, amount and idempotencyKey are required
       * - fromAccount and toAccount must be valid account IDs
       */

      const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

      if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                  message: "FromAccount, toAccount, amount and idempotencyKey are required"
            })
      }

      const fromUserAccount = await accountModel.findById({
            _id: fromAccount,
      });

      const toUserAccount = await accountModel.findById({
            _id: toAccount,
      });

      if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                  message: "Invalid fromAccount or toAccount"
            })
      }

      /**
       * 2. Validate the idempotency key
       * - Check if a transaction with the same idempotency key already exists
       */

      const isTransactionAlreadyExist = await transactionModel.findOne({
            idempotencyKey: idempotencyKey
      });

      if (isTransactionAlreadyExist) {
            if (isTransactionAlreadyExist.status === 'COMPLETED') {
                  return res.status(200).json({
                        message: "Transaction already completed",
                        transaction: isTransactionAlreadyExist
                  })
            }
            if (isTransactionAlreadyExist.status === 'PENDING') {
                  return res.status(200).json({
                        message: "Transaction is pending",
                  })
            }

            if (isTransactionAlreadyExist.status === 'FAILED') {
                  return res.status(500).json({
                        message: "Transaction previously failed",
                  })
            }


            if (isTransactionAlreadyExist.status === 'REVERSED') {
                  return res.status(500).json({
                        message: "Transaction was reversed, please initiate a new transaction",
                  })
            }

      }

      /**
       * 3. Check account status
       * - Both accounts must be active
       */

      if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
            return res.status(400).json({
                  message: "Both fromAccount and toAccount must be active to process the transaction"
            })
      }

      /**
       * 4. Derive sender balance form ledger
       * - Calculate the current balance of the sender by aggregating the ledger entries
       */

      const balance = await fromUserAccount.getBalance();

      if (balance < amount) {
            return res.status(400).json({
                  message: `Insufficient funds. Current balance is ${balance}. Required amount is ${amount}`
            })
      }

      /**
       * 5. Create transaction (PENDING)
       * - Create a new transaction document with status PENDING
       */

      let newTransaction;

      try {

            const session = await transactionModel.startSession();
            session.startTransaction();

            newTransaction = (await transactionModel.create([{
                  fromAccount,
                  toAccount,
                  amount,
                  idempotencyKey,
                  status: 'PENDING'
            }], { session }))[0];

            const debitLedgerEntry = await ledgerModel.create([
                  {
                        account: fromAccount,
                        amount: amount,
                        transaction: newTransaction._id,
                        type: 'DEBIT'

                  }], { session });

            await (() => {
                  return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
            })();

            const creditLedgerEntry = await ledgerModel.create([
                  {
                        account: toAccount,
                        amount: amount,
                        transaction: newTransaction._id,
                        type: 'CREDIT'
                  }], { session });

            await transactionModel.findOneAndUpdate(
                  { _id: newTransaction._id },
                  { status: 'COMPLETED' },
                  { session });

            await session.commitTransaction();
            session.endSession();

      } catch (error) {
            return res.status(400).json({
                  message: "Transaction is Pending due to an error, please try again later",
            })
      }

      // Send email notification to both sender and receiver  

      return res.status(201).json({
            message: "Transaction completed successfully",
            transaction: newTransaction

      })

}

async function createInitialFundsTransaction(req, res) {
      const { toAccount, amount, idempotencyKey } = req.body;

      if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                  message: "toAccount, amount and idempotencyKey are required"
            })
      }

      const toUserAccount = await accountModel.findById({
            _id: toAccount,
      });

      if (!toUserAccount) {
            return res.status(400).json({
                  message: "Invalid toAccount"
            })
      }

      const fromUserAccount = await accountModel.findOne({
            user: req.user._id
      });

      if (!fromUserAccount) {
            return res.status(400).json({
                  message: "System user account not found"
            })
      }

      const session = await transactionModel.startSession();
      session.startTransaction();

      const newTransaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
      },);

      const debitLedgerEntry = await ledgerModel.create([
            {
                  account: fromUserAccount._id,
                  amount: amount,
                  transaction: newTransaction._id,
                  type: 'DEBIT'
            }], { session });

      const creditLedgerEntry = await ledgerModel.create([
            {
                  account: toAccount,
                  amount: amount,
                  transaction: newTransaction._id,
                  type: 'CREDIT'
            }], { session });


      newTransaction.status = 'COMPLETED';
      await newTransaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
            message: "Initial funds transaction created successfully",
            transaction: newTransaction
      })
}

module.exports = {
      createTransaction,
      createInitialFundsTransaction,
      // list transactions for current user's accounts (or all for system users)
      async listTransactions(req, res) {
            try {
                  // if system user, return all transactions
                  if (req.user && req.user.systemUser) {
                        const list = await transactionModel.find({})
                              .populate({ path: 'fromAccount', populate: { path: 'user' } })
                              .populate({ path: 'toAccount', populate: { path: 'user' } })
                              .sort({ createdAt: -1 });
                        return res.json({ transactions: list });
                  }

                  // find user's accounts
                  const accounts = await accountModel.find({ user: req.user._id }).select('_id')
                  const accIds = accounts.map(a => a._id)

                  const list = await transactionModel.find({
                        $or: [{ fromAccount: { $in: accIds } }, { toAccount: { $in: accIds } }]
                  })
                        .populate({ path: 'fromAccount', populate: { path: 'user' } })
                        .populate({ path: 'toAccount', populate: { path: 'user' } })
                        .sort({ createdAt: -1 });

                  return res.json({ transactions: list });
            } catch (err) {
                  console.error(err)
                  return res.status(500).json({ message: 'Could not fetch transactions' })
            }
      }
}