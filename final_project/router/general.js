const express = require('express');
const axios = require('axios');
const books = require("./booksdb.js");
const generalRouter = express.Router();

// Route to get the list of books available in the shop using async-await with Axios
generalRouter.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://y21acs541-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to get book details based on ISBN using async-await with Axios
generalRouter.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get('http://y21acs541-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/book/${isbn}');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
});

// Route to get book details based on author using async-await with Axios
generalRouter.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://y21acs541-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books?author=${author}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Books by this author not found" });
    }
});

// Route to get all books based on title using async-await with Axios
generalRouter.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://y21acs541-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books?title=${title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Books with this title not found" });
    }
});

// Route to get book reviews
generalRouter.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Book reviews not found" });
    }
});

module.exports.general = generalRouter;
