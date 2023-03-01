const express = require('express');
const bodyParser = require('body-parser');
const scraper = require('./scraper');
const cors = require('cors');

// Create an express app
const app = express();
app.use(bodyParser.json());

// Set up a route to handle GET requests to the '/' path
app.get('/scraper', cors(), async (req, res) => {
  const users = await scraper.scraper(req.body.brand);
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  return res.status(200).json(users);
});

// Start the server
app.listen(8080, () => {
  console.log('Server listening on port 8080');
});

