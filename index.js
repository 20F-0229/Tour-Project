const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "project",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Database Connected");
});

app.post("/insert", function (req, res) {
  const saltRounds = 10;
  console.log("At server side");
  var Name = req.body.namefield;
  var Email = req.body.email;
  var Username = req.body.username;
  var Password = req.body.password;

  bcrypt.hash(Password, saltRounds, function (err, hash) {
    if (err) throw err;

    var query = `INSERT INTO traveller (Name, Email, Username, Password) 
      VALUES ('${Name}', '${Email}', '${Username}', '${hash}')`;

    console.log("hahah");
    db.query(query, function (err, result) {
      if (err) throw err;
      console.log("Data inserted successfully");
      res.send("Data inserted successfully");
    });
  });
});

app.post("/login", function (req, res) {
  console.log("At server");
  var username = req.body.username;
  var password = req.body.password;

  db.query(
    "SELECT * FROM traveller WHERE Username = ?",
    [username],
    function (error, results) {
      if (error) {
        console.log(error);
        res.json({
          success: false,
          message: "An error occurred. Please try again later.",
        });
        return;
      }

      if (results.length === 0) {
        res.json({ success: false, message: "Invalid username or password." });
        return;
      }

      var user = results[0];
      bcrypt.compare(password, user.Password, function (err, result) {
        if (err) throw err;
        if (result) {
          res.send("Successful");
        } else {
          res.json({
            success: false,
            message: "Invalid username or password.",
          });
        }
      });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate login credentials against database
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error querying database: ", err);
        res.status(500).json({
          success: false,
          message: "An error occurred. Please try again later.",
        });
        return;
      }

      if (results.length === 0) {
        res.status(401).json({
          success: false,
          message: "Invalid username or password.",
        });
        return;
      }

      const user = results[0];
      if (password !== user.password) {
        res.status(401).json({
          success: false,
          message: "Invalid username or password.",
        });
        return;
      }

      res.json({ success: true });
    }
  );
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});
