const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [ 
    {username: "prashant_100", password: "12345"}
];

// Function to validate if username is valid
const isValid = (username) => {
    let user = users.find(user => user.username === username);
    return !!user; // Return true if user exists, otherwise false
}

// Function to check if the username and password match
const authenticatedUser = (username, password) => {
    let user = users.find(user => user.username === username && user.password === password);
    return !!user; // Return true if both match, otherwise false
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Validate if the user exists
    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid username." });
    }

    // Authenticate the user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid password." });
    }

    // Create JWT token and save it in the session
    let token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });
    req.session.authorization = {
        accessToken: token,
        username // Save username in the session
    };

    // Respond with success
    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Access token is missing or session is expired, Please Check" });
    }

    const { review } = req.body; // Get review from request body
    const isbn = req.params.isbn; // Get ISBN from request parameters

    const username = req.session.authorization.username; // Get username from session

    // Find the book by ISBN
    const book = books[isbn]; // Assuming `books` is imported from booksdb.js

    // Check if book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Initialize reviews if they do not exist
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update the review for the user
    book.reviews[username] = review;

    // Respond with the updated reviews
    return res.status(200).json({ message: "Review added/modified successfully.", reviews: book.reviews });
});

// Add the delete route for reviews
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Check if the session exists
    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Access token is missing or session is expired." });
    }

    const isbn = req.params.isbn; // Get ISBN from request parameters
    const username = req.session.authorization.username; // Get username from session

    // Find the book by ISBN
    const book = books[isbn]; // Assuming `books` is imported from booksdb.js

    // Check if the book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the review exists for the user
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for the user." });
    }

    // Delete the user's review
    delete book.reviews[username];

    // Respond with a success message
    return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
