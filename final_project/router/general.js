const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;  // Extract username and password from the request body

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Register the new user (add to the users array)
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  // Retrieve all books from the books database
  const allBooks = books;

  // Send the books as a JSON response with proper formatting
  return res.status(200).send(JSON.stringify(allBooks, null, 2)); // 2 for indentation in JSON

//   return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
   // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book exists in the database
  const book = books[isbn];

  if (book) {
    // If the book is found, return the details
    return res.status(200).json(book);
  } else {
    // If the book is not found, return a 404 error
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase(); // Convert the author name to lowercase for case-insensitive matching

  let booksByAuthor = [];

  // Iterate through the books object to find books by the given author
  for (let isbn in books) {
    // Convert both to lowercase and check if the input author name is part of the stored author name
    if (books[isbn].author.toLowerCase().includes(author)) {
      booksByAuthor.push(books[isbn]);
    }
  }

  // If books are found by the author, return them
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: `No books found by author: ${author}` });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase(); // Convert the title to lowercase for case-insensitive matching

    let booksByTitle = [];
  
    // Iterate through the books object to find books by the given title
    for (let isbn in books) {
      // Convert both to lowercase and check if the input title is part of the stored title
      if (books[isbn].title.toLowerCase().includes(title)) {
        booksByTitle.push(books[isbn]);
      }
    }
  
    // If books are found by the title, return them
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: `No books found with title: ${title}` });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    
    // Check if the book exists by ISBN
    if (books[isbn]) {
        const reviews = books[isbn].reviews;
        // If reviews exist, return them, otherwise return a message saying no reviews found
        if (Object.keys(reviews).length > 0) {
            return res.status(200).json(reviews);
        } else {
            return res.status(200).json({ message: `No reviews found for book with ISBN: ${isbn}` });
        }
    } else {
        // If the book is not found, return an error message
        return res.status(404).json({ message: `Book not found with ISBN: ${isbn}` });
    }
});

module.exports.general = public_users;
