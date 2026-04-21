const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const path = require("path");

app.use(express.json());

// in-memory storage
const allNotes = [];
const users = [];

// 🔐 Middleware
function middleWare(req, res, next) {
    const { token } = req.headers;

    if (!token) {
        return res.status(401).send("You are not logged in!");
    }

    try {
        const decoded = jwt.verify(token, "harkirat123");
        req.user = decoded.username;
        next();
    } catch (err) {
        return res.status(403).send("Invalid token");
    }
}

// 📄 Serve HTML pages
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "signin.html"));
});

app.get("/notes-page", (req, res) => {
    res.sendFile(path.join(__dirname, "notes.html"));
});

// 📝 Add Note
app.post("/notes", middleWare, (req, res) => {
    const { notes } = req.body;

    if (!notes || notes.trim() === "") {
        return res.status(400).send("Note cannot be empty");
    }

    allNotes.push({
        username: req.user,
        notes: notes
    });

    res.status(201).json({
        message: "Note added successfully"
    });
});

// 📥 Get Notes (VERY IMPORTANT)
app.get("/notes-data", middleWare, (req, res) => {

    const userNotes = allNotes.filter(n => n.username === req.user);

    res.json({
        notes: userNotes
    });
});

// 👤 Signup
app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    // check if user exists
    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).send("User already registered");
    }

    users.push({ username, password });

    res.status(201).send("User registered successfully");
});

// 🔑 Signin
app.post("/signin", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).send("Invalid username or password");
    }

    const token = jwt.sign(
        { username: username },
        "harkirat123"
    );

    res.json({
        token: token
    });
});

// 🚀 Start server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});