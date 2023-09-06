const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return false;
    }
  }
  return true;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      return true;
    }
  }
  return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  let accessToken = jwt.sign(
    {
      data: password,
    },
    "access",
    { expiresIn: 60 * 60 }
  );

  req.session.authorization = {
    accessToken,
    username,
  };
  return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization["username"];
  const isbn = req.params.isbn;
  const currentReview = req.body.review;
  // if username not in reviews, add username and review
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews[username]) {
    books[isbn].reviews[username] = currentReview;
    return res.status(200).json(books[isbn]);
  } else {
    // update the review
    books[isbn].reviews[username] = currentReview;
    return res.status(200).json(books[isbn]);
  }
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization["username"];
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  } else {
    delete books[isbn].reviews[username];
    return res.status(200).json(books[isbn]);
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
