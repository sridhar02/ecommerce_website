const express = require("express");
const route = express.Router();
const pool = require("../db");

// get cart products end point
route.get("/", async (req, res) => {
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

// post to cart handler
route.post("/", async (req, res) => {
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

module.exports = route;
