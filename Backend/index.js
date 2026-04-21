const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const path = require("path");

const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

let users = [];
let allNote = [];

// =======================
// 🔥 PAGE ROUTES
// =======================

// Notes page (NO AUTH)
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// =======================
// 🔐 AUTH ROUTES
// =======================

// Signup
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });

  res.json({ message: "User registered successfully" });
});

// Signin
app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const token = jwt.sign({ username }, "harkirat123");

  res.json({
    message: "Login successful",
    token
  });
});

// =======================
// 🔐 MIDDLEWARE
// =======================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "harkirat123");
    req.username = decoded.username;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// =======================
// 📝 NOTES API
// =======================

// Add note
app.post("/notes", authMiddleware, (req, res) => {
  const { note } = req.body;

  allNote.push({
    username: req.username,
    note
  });

  res.json({ message: "Note added successfully" });
});

// Get notes (IMPORTANT: separate route)
app.get("/notes-data", authMiddleware, (req, res) => {
  const userNotes = allNote.filter(
    n => n.username === req.username
  );

  res.json({ notes: userNotes });
});

// =======================

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});