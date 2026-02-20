const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Enable CORS for the React frontend (set FRONTEND_URL in .env if different)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const corsOptions = process.env.NODE_ENV === 'production'
      ? { origin: FRONTEND_URL, credentials: true }
      : { origin: true, credentials: true } // allow any origin in development (useful for localhost ports)

app.use(cors(corsOptions));

/**
 * - Routes Required
 */

const authRouter = require('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.routes');

/**
 * - Use Routes
 */
app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/accounts", accountRouter);

module.exports = app;