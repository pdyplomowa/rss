const mongoose = require('mongoose');

const Url = mongoose.model('Url', new mongoose.Schema(
  {
    name: String
  },
  {
    collection: 'Urls',
    versionKey: false
  }
));

const Email = mongoose.model('Email', new mongoose.Schema(
  {
    name: String
  },
  {
    collection: 'Emails',
    versionKey: false
  }
));

function createEmail(data) {
  return new Email(data);
}

function createUrl(data) {
  return new Url(data);
}

module.exports = {
  Url,
  Email,
  createEmail,
  createUrl
}