require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const crypto = require('crypto');
const app = express();

// in-memory data storage
const db = new Map();

// random unique key generator
function generateUKey() {
  return crypto.randomBytes(16).toString('base64url')
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL shortner
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  let hostname;

  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname;
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const record = {
      original_url: url,
      short_url: generateUKey(),
    };

    db.set(record.short_url, record.original_url);
    return res.json(record);
  });
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const { shorturl } = req.params

  if (db.has(shorturl)) {
    return res.redirect(db.get(shorturl))
  }

  return res.json({ error: 'invalid shorturl' })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
