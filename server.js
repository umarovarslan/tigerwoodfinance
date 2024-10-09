const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating tokens
const path = require('path');


// Middleware to parse JSON data
app.use(bodyParser.json());

// Basic route to check the server
app.get('/', (req, res) => {
  res.send('Tigerwood Finance is running!');
});

// Serve static files from the public directory
app.use(express.static('public'));

// Route for the English homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the Russian homepage
app.get('/russian', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'russianindex.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Registration route
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
  
    // Hash the password before saving it to the database
    const hashedPassword = bcrypt.hashSync(password, 10);
  
    // Insert new investor into the database
    const query = `INSERT INTO investors (name, email, password) VALUES (?, ?, ?)`;
    db.run(query, [name, email, hashedPassword], function (err) {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(201).json({ id: this.lastID });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Query the investor from the database
    const query = `SELECT * FROM investors WHERE email = ?`;
    db.get(query, [email], (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      // Compare the provided password with the stored hashed password
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: user.id }, 'secretKey', { expiresIn: '1h' });
  
      // Respond with the token
      res.json({ token });
    });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ error: 'Access Denied' });
  
    jwt.verify(token, 'secretKey', (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid Token' });
      req.user = user;
      next();
    });
  };
  
  // Investment dashboard route (protected)
  app.get('/investments', authenticateToken, (req, res) => {
    const query = `SELECT * FROM investments WHERE investor_id = ?`;
    db.all(query, [req.user.id], (err, investments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(investments);
    });
  });
  
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the dashboard (index.html)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Query the investor from the database
    const query = `SELECT * FROM investors WHERE email = ?`;
    db.get(query, [email], (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      // Compare the provided password with the stored hashed password
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: user.id }, 'secretKey', { expiresIn: '1h' });
  
      // Respond with the token
      res.json({ token });
    });
  });

  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });
  