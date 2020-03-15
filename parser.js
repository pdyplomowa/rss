const Parser = require('rss-parser');

function parseUrl(url) {
  const parser = new Parser();
  return parser.parseURL(url);
}

module.exports = {
  parseUrl
}