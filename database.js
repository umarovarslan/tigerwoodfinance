const sqlite3 = require('sqlite3').verbose();

// Create or open the database file
const db = new sqlite3.Database('./investment.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the investment database.');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Investors table (storing investor information)
  db.run(`CREATE TABLE IF NOT EXISTS investors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  // Investments table (storing investment information)
  db.run(`CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_id INTEGER,
    amount REAL NOT NULL,
    growth_rate REAL NOT NULL,
    FOREIGN KEY (investor_id) REFERENCES investors (id)
  )`);
});

module.exports = db;

db.serialize(() => {
    // Add some sample investment data (only run once to avoid duplicates)
    db.run(`INSERT INTO investments (investor_id, amount, growth_rate) VALUES (1, 1000, 0.05)`);
    db.run(`INSERT INTO investments (investor_id, amount, growth_rate) VALUES (1, 500, 0.03)`);
    db.run(`INSERT INTO investments (investor_id, amount, growth_rate) VALUES (1, 2000, 0.07)`);
  });