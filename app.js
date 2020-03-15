const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const db = require('./db');
const { get, save, send, deleteUrl } = require('./api');

dotenv.config();
db.connect();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.get('/', get);
app.post('/save', save);
app.post('/send', send);
app.post('/delete', deleteUrl);

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`));