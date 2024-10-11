const express = require('express');
const axios = require('axios');
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
public_users.get('/', async function (req, res) {
    try {
      // Simulate an asynchronous operation (e.g., fetching from a database)
      const getBooks = async () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(books); // Simulate fetching the books database
          }, 1000); // Simulating delay for asynchronous behavior
        });
      };
  
      // Await for the promise to resolve and retrieve the book list
      const allBooks = await getBooks();
  
      // Send the books as a JSON response with proper formatting
      return res.status(200).send(JSON.stringify(allBooks, null, 2)); // 2 for indentation in JSON
    } catch (error) {
      // Handle any potential errors during the async operation
      return res.status(500).json({ message: "Error retrieving book list", error });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      // Simulate an asynchronous operation (e.g., fetching the book by ISBN from a database)
      const getBookByISBN = async (isbn) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (books[isbn]) {
              resolve(books[isbn]); // Resolve with the book details if found
            } else {
              reject("Book not found"); // Reject if the book is not found
            }
          }, 1000); // Simulating delay for async behavior
        });
      };
  
      // Retrieve the ISBN from the request parameters
      const isbn = req.params.isbn;
  
      // Await the promise to resolve or reject
      const book = await getBookByISBN(isbn);
  
      // If the book is found, return the details
      return res.status(200).json(book);
    } catch (error) {
      // If an error occurs (e.g., book not found), return a 404 error
      return res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const author = req.params.author.toLowerCase(); // Convert the author name to lowercase for case-insensitive matching
  
      // Simulate an asynchronous call using axios to get the books (assuming you fetch it from an API)
      const getBooksByAuthor = async (author) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            let booksByAuthor = [];
            for (let isbn in books) {
              if (books[isbn].author.toLowerCase().includes(author)) {
                booksByAuthor.push(books[isbn]);
              }
            }
            if (booksByAuthor.length > 0) {
              resolve(booksByAuthor);
            } else {
              reject(`No books found by author: ${author}`);
            }
          }, 1000); // Simulated delay for async behavior
        });
      };
  
      // Await the promise to resolve or reject
      const booksByAuthor = await getBooksByAuthor(author);
  
      // If books are found, return the details
      return res.status(200).json(booksByAuthor);
  
    } catch (error) {
      // If no books are found or another error occurs, return a 404 error
      return res.status(404).json({ message: error });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase(); // Convert title to lowercase for case-insensitive matching

    try {
        // Simulate an async operation such as fetching from a remote server/database
        // const response = await axios.get('https://yourbooksapi.com/allbooks'); // Replace with actual API if applicable

        // Use the response to filter books (if axios fetch is used)
        // const booksData = books; // Use fetched data or fallback to local books

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

    } catch (error) {
        // Handle errors from the axios call
        console.error("Error fetching books:", error);
        return res.status(500).json({ message: "Error fetching books. Please try again later." });
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
