const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  console.log(req.body);
  if (!req.body.username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!req.body.password) {
    return res.status(400).json({ message: "Password is required" });
  }
  // check if the username is already taken

  if (!isValid(req.body.username)) {
    return res.status(400).json({ message: "Username already taken" });
  }
  // add the user to the database
  const newUser = {
    username: req.body.username,
    password: req.body.password,
  };
  users.push(newUser);
  return res.status(200).json(newUser);
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  let getBooks = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  });
  getBooks
    .then((books) => {
      return res.status(200).json(books);
    })
    .error((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let getBook = new Promise((resolve, reject) => {
    const book = books[req.params.isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
  getBook
    .then((book) => {
      return res.status(200).json(book);
    })
    .error((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let getBook = new Promise((resolve, reject) => {
    const author = decodeURIComponent(req.params.author);
    const keyList = Object.keys(books);
    const bookIds = keyList.filter((key) => {
      return books[key].author === author;
    });
    if (bookIds.length > 0) {
      resolve(books[bookIds[0]]);
    } else {
      reject({ message: "Book not found" });
    }
  });
  getBook
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(404).json(err);
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let getBook = new Promise((resolve, reject) => {
    const title = decodeURIComponent(req.params.title);
    const keyList = Object.keys(books);
    const bookIds = keyList.filter((key) => {
      return books[key].title === title;
    });
    if (bookIds.length > 0) {
      resolve(books[bookIds[0]]);
    } else {
      reject({ message: "Book not found" });
    }
  });
  getBook
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(404).json(err);
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
