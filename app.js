const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: './' });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));