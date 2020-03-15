const mongoose = require('mongoose');

function connect() {
  mongoose.Promise = global.Promise;
  const mongoUri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_USERNAME}.documents.azure.com:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl=true`;
  mongoose.set('debug', true);
  mongoose.connect(mongoUri, { useUnifiedTopology: true, useNewUrlParser: true });
}

module.exports = {
  connect
}