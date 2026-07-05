const db = require("../config/db");

(exports.getAllGames = (req, res) => {
  const query =
    "SELECT games.*, GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags FROM games JOIN game_tags ON game_tags.id_game = games.id_game JOIN tags ON tags.id_tags = game_tags.id_tags GROUP BY games.id_game";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Ошибка при получении игр:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    const resultGame = result.map((game) => {
      const tagsArr = game.tags.split(",");

      const tagsObjects = tagsArr.map((name) => ({ name }));

      return {
        ...game,
        tags: tagsObjects,
      };
    });

    res.json(resultGame);
  });
}),
  (exports.AddGames = (req, res) => {
    const { title, description, price, tags } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Файл не был загружен" });
    }

    const host = `http://localhost:5000`;

    const imagePath =
      host + file.path.replace(/^.*?(uploads)/, "/$1").replace(/\\/g, "/");

    console.log(imagePath);

    const query =
      "INSERT INTO games (title, description, price, image) VALUES (?, ?, ?, ?)";

    db.query(query, [title, description, price, imagePath], (err, result) => {
      if (err) {
        console.error("Ошибка при добавлении Игр:", err);
        return res.status(500).json({ error: "Ошибка сервера" });
      }

      const newGameID = result.insertId;

      if (Array.isArray(tags) && tags.length > 0) {
        const tagValue = tags.map((tagId) => [newGameID, tagId]);

        const query = "INSERT INTO game_tags (id_game, id_tags) VALUES  ?";

        db.query(query, [tagValue], (err2) => {
          if (err2) {
            console.error("Ошибка при добавлении тегов:", err2);
            return res
              .status(500)
              .json({ error: "Ошибка сервера при связывании тегов" });
          }
          res.json({ message: "Игра успешно добавлены!" });
        });
      }

      // res.status(201).json({ message: "Данные успешно добавлены" });
    });
  }),
  (exports.delGames = (req, res) => {
    const { id_game } = req.params;

    // console.log("Получен id_game:", id_game);

    const query = "DELETE FROM games WHERE id_game = ?";

    db.query(query, [id_game], (err, result) => {
      if (err) {
        res.status(500).json({ error: "Не удалось удалить игру" });
        return;
      }

      // console.log("Результат удаления:", result);
      res.json({ message: "Игра удалена" });
    });
  });
