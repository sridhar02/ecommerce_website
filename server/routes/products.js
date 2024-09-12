const express = require("express");
const route = express.Router();

const pool = require("../db");

route.get("/", async (req, res) => {
  try {
    const products = await pool.query(`SELECT * FROM products`);
    res.status(200).json(products.rows);
  } catch (err) {
    console.log(err);
  }
});

module.exports = route;
