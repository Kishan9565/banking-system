const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
      token: {
            type: String,
            required: [true, 'Token is required to be added to the blacklist.'],
            unique: true,
      }
}, {
      timestamps: true,
});

tokenBlacklistSchema.index({ createdAt: 1 },
      { expireAfterSeconds: 60 * 60 * 30 } // Tokens will be removed from the blacklist after 3 days (adjust as needed)
);

const tokenBlacklistModel = mongoose.model('tokenBlackList', tokenBlacklistSchema);

module.exports = tokenBlacklistModel;