const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();



/**
 * - Post /api/account/
 * - Create a new account for the authenticated user.
 * - Protected route, requires authentication.
 */

router.post('/', authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * - Get /api/account/
 * - Retrieve the account details of the authenticated user.
 * - Protected route, requires authentication.
 */

router.get('/', authMiddleware.authMiddleware, accountController.getUserAccountController);

/**
 * - GET /api/account/balance/:accountId
 */                                                                                                                                                                           

router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalanceController);

// GET /api/accounts/all - list all active accounts (for selecting recipients)
router.get('/all', authMiddleware.authMiddleware, accountController.listAccountsController);

module.exports = router;