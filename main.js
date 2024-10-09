require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 4000;

// database connection
mongoose.connect(process.env.DB_URI)
const db = mongoose.connection;
db.on('error', err => console.log(err));
db.once("open", () => console.log("Connected to the DB!"));

// Middlewares
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(session({
  secret: 'my secret key',
  saveUninitialized: true,
  resave: false,
}))

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static('uploads'));

// Set Template Engine
app.set('view engine', 'ejs');

// route prefix
app.use("", require("./routes/routes"));

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});