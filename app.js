const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const Parser = require('rss-parser');

dotenv.config();
mongoose.Promise = global.Promise;

const app = express();
const mongoUri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_USERNAME}.documents.azure.com:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl=true`;

mongoose.set('debug', true);
// mongoose.connect(mongoUri, { useUnifiedTopology: true, useNewUrlParser: true });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

function feedToHtml(feed) {
  const placeholder = '[empty]';
  return `
    <div>
      <strong>Feed url</strong>
      <a href="${feed.feedUrl || ''}">${feed.feedUrl || placeholder}</a>
    </div>
    <div>
      <strong>Title</strong>
      <span>${feed.title || placeholder}</span>
    </div>
    <div>
      <strong>Description</strong>
      <span>${feed.description || placeholder}</span>
    </div>
    <div>
      <strong>Link</strong>
      <a href="${feed.link || ''}">${feed.link || placeholder}</a>
    </div>
    <div>
      <strong>Items</strong>
      <ul>
        ${feed.items.map((item) => `
          <li>
            <div>
              <strong>Title</strong>
              <span>${item.title || placeholder}</span>
            </div>
            <div>
              <strong>Link</strong>
              <a href="${item.link || ''}">${item.link || placeholder}</a>
            </div>
            <div>
              <strong>Date</strong>
              <span>${item.pubDate || placeholder}</span>
            </div>
            <div>
              <strong>Creator</strong>
              <span>${item.creator || placeholder}</span>
            </div>
            <div>
              <strong>Content</strong>
              <span>${item.content || placeholder}</span>
            </div>
            <div>
              <strong>Categories</strong>
              <span>${item.categories || placeholder}</span>
            </div>
          </li>
        `)}
      </ul>
    </div>
    <hr>
  `;
}

app.get('/', async (req, res) => {
  // const urls = await Url.find({}).exec();
  // const [email] = await Email.find({}).exec();
  const urls = [];
  const email = { name: 'testowo' };

  const parser = new Parser();
  const feed = await parser.parseURL('https://www.reddit.com/.rss');
  const emailView = feedToHtml(feed);

  res.render('index', { urls, email, emailView });
});

app.post('/save', async (req, res) => {
  const email = req.body.email && req.body.email.trim();
  if (email) {
    const emails = await Email.find({}).exec();
    if (emails.length === 0) {
      const emailModel = new Email({ name: email });
      await emailModel.save({ upsert: true });
    }
  }

  const url = req.body.url && req.body.url.trim();
  if (url) {
    const urlModel = new Url({ name: url });
    await urlModel.save({ upsert: true });
  }
  res.redirect('/');
});

app.post('/send', async (req, res) => {
  // const msg = {
  //   to: 'Antkowiak_57335@cloud.wsb.wroclaw.pl',
  //   from: 'Antkowiak_57335@cloud.wsb.wroclaw.pl',
  //   subject: 'Sending with Twilio SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // };
  // try {
  //   await sgMail.send(msg);
  // } catch (err) {
  //   console.error(err.toString());
  // }

  res.redirect('/');
})

app.post('/delete', async (req, res) => {
  await Url.findOneAndRemove({ _id: req.body.id });
  res.redirect('/');
})

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`));