require("dotenv").config();
const PORT = 5000;
const saltRounds = 10;

// required packages
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// routes import
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

//middleware
app.use(cors());
app.use(express.json()); //req.body
app.use(express.urlencoded({ extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// routes
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`)
  console.log(`api docs are started at route http://localhost:5000/api-docs`);  
});
