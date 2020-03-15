const { Url, Email, createEmail, createUrl } = require('./models');
const { parseUrl } = require('./parser');
const sgMail = require('@sendgrid/mail');

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
        ${feed.items && feed.items.map((item) => `
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

async function get(req, res) {
  const urls = await Url.find({}).exec();
  const [email] = await Email.find({}).exec();
  let emailView = '';
  for (const url of urls) {
    const feed = await parseUrl(url.name);
    emailView += feedToHtml(feed);
  }
  res.render('index', { urls, email, emailView });
}


async function save(req, res) {
  const email = req.body.email && req.body.email.trim();
  if (email) {
    const emails = await Email.find({}).exec();
    if (emails.length === 0) {
      const emailModel = createEmail({ name: email });
      await emailModel.save({ upsert: true });
    }
  }

  const url = req.body.url && req.body.url.trim();
  if (url) {
    const urlModel = createUrl({ name: url });
    await urlModel.save({ upsert: true });
  }
  res.redirect('/');
}

async function send(req, res) {
  const [email] = await Email.find({}).exec();
  if (email) {
    const urls = await Url.find({}).exec();
    if (urls.length > 0) {
      let emailView = '';
      for (const url of urls) {
        const feed = await parseUrl(url.name);
        emailView += feedToHtml(feed);
      }
      const msg = {
        to: email.name,
        from: email.name,
        subject: 'RSS app info',
        text: emailView,
        html: emailView,
      };
      try {
        await sgMail.send(msg);
      } catch (err) {
        console.error(err.toString());
      }
    }
  }
  res.redirect('/');
}

async function deleteUrl(req, res) {
  await Url.findOneAndRemove({ _id: req.body.id });
  res.redirect('/');
}

module.exports = {
  get,
  save,
  send,
  deleteUrl
}