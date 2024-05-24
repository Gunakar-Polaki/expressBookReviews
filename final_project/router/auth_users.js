const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

const jwtSecret = 'your_jwt_secret'; // Use a secure secret key

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { isbn } = req.params;
    const { review } = req.body;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
      return res.status(400).json({ message: "Review text is required" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = [];
    }

    books[isbn].reviews.push({ username: decoded.username, review });
    return res.status(200).json({ message: "Review added successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Access token is missing or invalid" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
