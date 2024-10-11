const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists
    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Access token is missing or session expired." });
    }

    const token = req.session.authorization.accessToken;  // Retrieve the access token from session

    // Verify the token
    jwt.verify(token, "fingerprint_customer", (err, user) => { // Ensure this matches the signing key
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }

        // Attach the user to the request object
        req.user = user;
        
        // Proceed to the next middleware or route handler
        next();
    });
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
