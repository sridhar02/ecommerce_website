require("dotenv").config();
const PORT = 5000;
const saltRounds = 10;

// required packages

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const Str = require("@supercharge/strings");

//middleware
app.use(cors());
app.use(express.json()); //req.body

// routes

// signup end ppoint
app.post("/user/signup", (req, res) => {
  try {
    const { username, email, password, phonenumber } = req.body;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const createUser = await pool.query(
        `INSERT INTO users(username,email,password,phonenumber,created_at,updated_at)
        VALUES($1,$2,$3,$4,$5,$6)`,
        [username, email, hash, phonenumber, new Date(), new Date()]
      );
      res.json("user created sucessfully");
    });
    console.log("user created sucessfully");
  } catch (err) {
    console.error(err.message);
  }
});

// signin end point
app.post("/user/sign_in", async (req, res) => {
  try {
    const { email, password } = req.body;
    const rows = await pool.query(
      `SELECT password,id FROM users WHERE email=$1`,
      [email]
    );
    const hash = rows.rows[0].password;
    const userId = rows.rows[0].id;
    bcrypt.compare(password, hash, (err, result) => {
      let secret = Str.random(32);
      const insertIntoLogins = pool.query(
        `INSERT INTO logins(user_id,secret,created_at,updated_at)
								VALUES($1,$2,$3,$4)`,
        [userId, secret, new Date(), new Date()]
      );
      result
        ? res.status(200).json({
            userId,
            secret,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        : res.json("email or password is wrong");
    });
  } catch (error) {
    console.log(error);
  }
});

// get products end point
app.get("/products", async (req, res) => {
  try {
    const products = await pool.query(`SELECT * FROM products`);
    res.status(200).json(products.rows);
  } catch (err) {
    console.log(err);
  }
});

// get cart products end point
app.get("/cart", async (req, res) => {
  try {
    const cartProducts = await pool.query(
      `SELECT products.id,products.name,products.image,products.price,cart.quantity FROM products JOIN cart ON cart.product_id = products.id 
      WHERE cart.user_id =  $1 ORDER BY products.id ASC`,
      [8]
    );
    res.status(200).json(cartProducts.rows);
  } catch (err) {
    console.log(err);
  }
});

// get order products end point
app.get("/orders", async (req, res) => {
  try {
    const orderProducts = await pool.query(
      `WITH order_cte AS ( SELECT id, created_at FROM orders WHERE user_id=$1)
      SELECT products.id, products.name, products.image, products.price, order_products.quantity 
      FROM order_products JOIN products ON  order_products.product_id= products.id WHERE order_id IN (SELECT id FROM order_cte)`,
      [8]
    );
    res.status(200).json(orderProducts.rows);
  } catch (err) {
    console.log(err);
  }
});

// update user information
app.put("/user", async (req, res) => {
  try {
    const orderProducts = await pool.query(
      `WITH order_cte AS ( SELECT count(*) FROM cart WHERE user_id = $1 AND product_id = $2)
      SELECT products.id, products.name, products.image, products.price, order_products.quantity 
      FROM order_products JOIN products ON  order_products.product_id= products.id WHERE order_id IN (SELECT id FROM order_cte)`,
      [8]
    );
    res.status(200).json(orderProducts.rows);
  } catch (err) {
    console.log(err);
  }
});

// post to cart handler

app.post("/cart", async (req, res) => {
  try {
    const { product_id } = req.body;
    const secret = req.headers.authorization.split(" ")[1];
    const userId = await pool.query(
      `SELECT user_id FROM logins where secret=$1`,
      [secret]
    );
    console.log(userId.rows[0].user_id);
    let count = 0;
    const insertIntoCart = await pool.query(
      `INSERT INTO cart(product_id,user_id,Quantity)VALUES($1,$2,$3)`[
        (product_id, userId.rows[0].user_id, count++)
      ]
    );
    res.status(201);
  } catch (err) {
    console.log(err);
  }
});

// post to orders table

app.post("/order", async (req, res) => {
  try {
    const { userId } = req.body;
    const insertIntoorders = await pool.query(
      `WITH order_cte AS ( INSERT INTO orders (user_id,created_at) VALUES($1,$2) RETURNING *),
      product_cte AS ( SELECT product_id,quantity FROM cart WHERE user_id IN (select * from order_cte))
      INSERT INTO order_products (order_id, product_id, quantity) VALUES from (select product_id,quantity from product_cte)`,
      [userId, new Date()]
    );
    res.status(200).json("product inserted into cart");
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
