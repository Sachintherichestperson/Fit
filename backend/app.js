const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');
const jwt = require("jsonwebtoken");
require("./config/mongoose-connection");
const cookieParser = require("cookie-parser");
const BrandMongo = require("./mongoose/Brandmongo");
const usermongo = require('./mongoose/Usermongo');
const Productmongo = require("./mongoose/Productmongo");
const ChallengeMongo = require("./mongoose/Challengemongo");
const session = require("express-session");
const Brandmongo = require("./mongoose/Brandmongo");
const isloggedin = require('./middleware/isloggedin');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");


app.post('/Register',async (req, res) => {
    const { username, email, Mobile, password } = req.body;
    console.log(req.body);

    const user = new usermongo({
        username,
        email,
        Mobile,
        password,
    });

    await user.save();

    const token = jwt.sign({ email, id: user._id }, 'ewyfif8787347ry378', {
        expiresIn: '7d',
    });

    res.cookie('username', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
    });
    console.log(token);

    res.json({
        success: true,
        message: 'Registration successful',
        user: {
            username: user.username,
            email: user.email,
            Mobile: user.Mobile,
        },
        token,
    });
});

app.get('/validate-token', isloggedin, (req, res) => {
    res.status(200).json({ valid: true });
});

app.get("/", (req, res) => {
    res.render("Home");
});

app.get("/Challenges", (req, res) => {
    res.render("Challenges");
});

app.get("/Store",async (req, res) => {
  const Products = await Productmongo.find({}).lean();
  console.log(Products);
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds

  const newArrivals = Products.filter(product => new Date(product.createdAt) >= twoDaysAgo);
  const normalProducts = Products.filter(product => new Date(product.createdAt) < twoDaysAgo);

  const popular = Products.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  const mostSold = Products.sort((a, b) => (b.Sold || 0) - (a.Sold || 0)).slice(0, 10);

  Products.trendingScore = (Products.views * 0.4) + (Products.Sold * 0.2);


  res.render("Store", { Products, popular, newArrivals });
});

app.get("/product-details/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await Productmongo.findById(productId);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  // Increment views
  product.views = (product.views || 0) + 1;
  await product.save();
  res.status(200).json({ message: 'Product details fetched successfully' });
});

app.get("/GYM", (req, res) => {
    res.render("GYM");
});

app.get("/Profile", (req, res) => {
    res.render("Profile");
});






app.listen(3000);