const express = require('express');
const bodyParser = require('body-parser');
const scraper = require('./scraper');

// Create an express app
const app = express();
app.use(bodyParser.json());

// Set up a route to handle GET requests to the '/' path
app.get('/scraper', async (req, res) => {
  const response = await scraper.scraper(req.body.brand);
  return res.status(200).json({
    result: response,
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

