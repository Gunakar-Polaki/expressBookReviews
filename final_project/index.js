const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
let users = [];
const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" })
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" })
    }
});

app.post("/customer/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

app.post("/customer/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(400).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user." });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

// Function to check if username already exists
function doesExist(username) {
    return users.some(user => user.username === username);
}
// Update or add a book review
const regd_users = express.Router();

// Update or add a book review
app.put("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const isbn = req.params.isbn;
        const review = req.query.review;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!review) {
            return res.status(400).json({ message: "Review text is required" });
        }

        // Check if the user has already reviewed the book
        const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === decoded.username);
        if (existingReviewIndex !== -1) {
            // Update existing review
            books[isbn].reviews[existingReviewIndex].review = review;
            return res.status(200).json({ message: "Review updated successfully" });
        } else {
            // Add new review
            books[isbn].reviews.push({ username: decoded.username, review });
            return res.status(200).json({ message: "Review added successfully" });
        }
    } catch (error) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }
});

// Delete a book review
app.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const isbn = req.params.isbn;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Filter out the reviews by the current user
        books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== decoded.username);

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }
});

// Attach review routes to '/customer/auth' path
app.use("/customer/auth", regd_users);
