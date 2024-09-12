const express = require("express");
const route = express.Router();
const pool = require("../db");

// get order products end point
route.get("/", async (req, res) => {
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

// post to orders table
route.post("/", async (req, res) => {
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

module.exports = route;
