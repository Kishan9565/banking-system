const accountModel = require('../models/account.model');

/** * Create a new account for the authenticated user.

 */

async function createAccountController(req, res) {

      const user = req.user;
      const account = await accountModel.create({ user: user._id });
      // new account has zero balance
      const accountObj = account.toObject ? account.toObject() : account;
      accountObj.balance = 0;

      res.status(201).json({ account: accountObj });

}

async function getUserAccountController(req, res) {

      const user = req.user;
      const account = await accountModel.findOne({ user: user._id });
      if (!account) {
            return res.status(200).json({ account: null });
      }
      const balance = await account.getBalance();
      const accountObj = account.toObject ? account.toObject() : account;
      accountObj.balance = balance;

      res.status(200).json({ account: accountObj });

}

async function getAccountBalanceController(req, res) {

      const { accountId } = req.params;
      const account = await accountModel.findById({
            _id: accountId,
            user: req.user._id
      });

      if (!account) {
            return res.status(404).json({
                  message: 'Account not found'
            });
      }

      const balance = await account.getBalance();

      res.status(200).json({
            accountId: account._id,
            balance: balance
      });

}

async function listAccountsController(req, res) {
      // Return list of accounts with user info (name, email) populated
      const accounts = await accountModel.find({ status: 'ACTIVE' }).populate({ path: 'user', select: 'name email' }).lean();
      // map to minimal shape
      const out = accounts.map(a => ({ _id: a._id, user: a.user ? { _id: a.user._id, name: a.user.name, email: a.user.email } : null, currency: a.currency, status: a.status }));
      res.status(200).json({ accounts: out });
}
module.exports = {
      createAccountController,
      getUserAccountController,
      getAccountBalanceController,
      listAccountsController
}
