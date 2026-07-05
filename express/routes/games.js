const express = require("express");

const router = express.Router();
const gameController = require("../controller/gameController");
const upload = require("../middleware/uploadMiddleware");

router.get("/games", gameController.getAllGames);
router.post("/addGame", upload.single("image"), gameController.AddGames);
router.delete("/admin/del/:id_game", gameController.delGames);

module.exports = router;
