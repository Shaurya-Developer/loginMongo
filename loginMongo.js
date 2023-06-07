// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const { ObjectId } = require("mongodb");
// Set up the express app
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(express.static("uploads"));

app.use(
  session({
    secret: "HAFSsyw5124$#$%^fgm",
    saveUninitialized: true,
    resave: false,
  })
);
// Connect to MongoDB Atlas
// const username = "U1205"; // Replace with your roll number
// const password = "your_password"; // Replace with your MongoDB Atlas password
mongoose
  .connect(
    "mongodb+srv://shaurya1173be20:tLfjoRmIBbvjLgtB@cluster0.8kqakvw.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  emailAddress: String,
  password: String,
  userImage: String,
});

// Create user model
const User = mongoose.model("User", userSchema);

// Set up multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { emailAddress, password } = req.body;
  const user = await User.findOne({ emailAddress, password });
  req.session.user = user;
  res.redirect("/dashboard");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { name, emailAddress, password } = req.body;

  const user = new User({
    name,
    emailAddress,
    password,
  });

  if (!user) return res.redirect("/signup");
  await user.save();
  res.redirect("/");
});

app.get("/dashboard", (req, res) => {
  console.log(req.session);
  const { user } = req.session;
  res.render("dashboard", { user });
});

app.get("/upload", (req, res) => {
  const { user } = req.session;
  res.render("upload", { user });
});

app.post("/upload", upload.single("userImage"), async (req, res) => {
  const { user } = req.session;
  console.log(user);
  const { filename } = req.file;

  res.render("dashboard", { user: user, filename: filename });
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
