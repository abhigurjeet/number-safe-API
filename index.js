require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const userRoutes = require("./routes/userRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRoutes);

app.listen(3000, () => console.log("server running"));
