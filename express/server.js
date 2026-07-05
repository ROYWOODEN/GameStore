const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

console.log("Подключение к MySQL настроено!");

// const db = require("../express/config/db");

const gameRoutes = require("./routes/games");
const tagRoutes = require("./routes/tags");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const searchRoutes = require("./routes/search");
const basketRoutes = require("./routes/basket");

app.use(gameRoutes);
app.use(tagRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(searchRoutes);
app.use(basketRoutes);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
