const saltRounds = 10;

const express = require("express");
const route = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const Str = require("@supercharge/strings");

const errorMessage = { status: "error" };
const isEmpty = (input) => {
  if (input === undefined || input === "") {
    return true;
  }
  if (input.replace(/\s/g, "").length) {
    return false;
  }
  return true;
};

const status = {
  success: 200,
  error: 500,
  notfound: 404,
  unauthorized: 401,
  conflict: 409,
  created: 201,
  bad: 400,
  nocontent: 204,
};

// user signup route
route.post("/signup", (req, res) => {
  try {
    const { username, email, password, phonenumber } = req.body;
    if (isEmpty(email) || isEmpty(password)) {
      errorMessage.error = "Email or Password detail is missing";
      return res.status(status.bad).send(errorMessage);
    }

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
    errorMessage.error = "Operation was not successful";
    res.status(status.bad).send(errorMessage);
  }
});

// signin end point
route.post("/sign_in", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (isEmpty(email) || isEmpty(password)) {
      errorMessage.error = "Email or Password detail is missing";
      return res.status(status.bad).send(errorMessage);
    }

    const rows = await pool.query(
      `SELECT password,id FROM users WHERE email=$1`,
      [email]
    );
    const hash = rows.rows[0].password;
    const userId = rows.rows[0].id;
    bcrypt.compare(password, hash, async (err, result) => {
      let secret = Str.random(32);
      const insertIntoLogins = await pool.query(
        `INSERT INTO logins(user_id,secret,created_at,updated_at)
                                  VALUES($1,$2,$3,$4) returning *`,
        [userId, secret, new Date(), new Date()]
      );
    //   console.log(insertIntoLogins.rows);
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
    errorMessage.error = "Operation was not successful";
    res.status(status.bad).send(errorMessage);
  }
});

// update user information
route.put("/user", async (req, res) => {
  try {
    const orderProducts = await pool.query(
      `WITH order_cte AS ( SELECT count(*) FROM cart WHERE user_id = $1 AND product_id = $2)
        SELECT products.id, products.name, products.image, products.price, order_products.quantity 
        FROM order_products JOIN products ON  order_products.product_id= products.id WHERE order_id IN (SELECT id FROM order_cte)`,
      [8]
    );
    res.status(200).json(orderProducts.rows);
  } catch (err) {
    errorMessage.error = "Operation was not successful";
    res.status(status.bad).send(errorMessage);
  }
});

module.exports = route;
