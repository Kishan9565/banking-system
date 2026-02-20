const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const transactionController = require('../controllers/transaction.controller');
const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction.
 */

transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 *  - Create initial funds transcation from system user. 
 */

transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

// GET /api/transactions/history - get transaction history for current user (or all for system users)
transactionRoutes.get('/history', authMiddleware.authMiddleware, transactionController.listTransactions);

module.exports = transactionRoutes;