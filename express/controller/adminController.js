const db = require("../config/db");
const path = require("path");

// Запрос на получения конкретной игры для редактирования
(exports.GetEditGames = (req, res) => {
  const { id_game } = req.params;

  const queryGame =
    "SELECT games.*, GROUP_CONCAT(DISTINCT tags.id_tags SEPARATOR ', ') AS tag_ids, GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags FROM games JOIN game_tags ON game_tags.id_game = games.id_game JOIN tags ON tags.id_tags = game_tags.id_tags WHERE games.id_game = ? GROUP BY games.id_game";

  db.query(queryGame, id_game, (err, result) => {
    if (err) {
      console.error("Ошибка при получении игры:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Игра не найдена" });
    }

    const resultGame = result.map((game) => {
      const tagsArr = game.tags.split(",");
      const tagIds = game.tag_ids.split(",");

      const tagsObjects = tagsArr.map((name, index) => ({
        id_tags: Number(tagIds[index]),
        name: name,
      }));

      return {
        ...game,
        tags: tagsObjects,
      };
    });

    res.json(resultGame);
  });
}),
  // Запрос на изменение данных
  (exports.EditGames = (req, res) => {
    const { id_game } = req.params;

    const { title, description, price } = req.body;

    const file = req.file;
    const host = `http://localhost:5000`;

    let imagePath;

    if (file) {
      imagePath =
        host + file.path.replace(/^.*?(uploads)/, "/$1").replace(/\\/g, "/");

      const query =
        "UPDATE games SET title = ?, description = ?, price = ?, image = ? WHERE id_game = ?";

      db.query(
        query,
        [title, description, price, imagePath, id_game],
        (err, result) => {
          if (err) {
            console.error("Ошибка при обновлении игры:", err);
            return res
              .status(500)
              .json({ error: "Ошибка сервера при обновлении данных" });
          }

          if (result.affectedRows === 0) {
            return res
              .status(404)
              .json({ error: "Игра с таким ID не найдена" });
          }

          res.status(200).json({ message: "Данные об игре успешно обновлены" });
        }
      );
    } else {
      const query =
        "UPDATE games SET title = ?, description = ?, price = ? WHERE id_game = ?";

      db.query(query, [title, description, price, id_game], (err, result) => {
        if (err) {
          console.error("Ошибка при обновлении игры:", err);
          return res
            .status(500)
            .json({ error: "Ошибка сервера при обновлении данных" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Игра с таким ID не найдена" });
        }

        res.status(200).json({ message: "Данные об игре успешно обновлены" });
      });
    }
  }),
  // Запрос на удаление связи с тегами и игрой
  (exports.EditTagsDel = (req, res) => {
    const { id_game } = req.params;

    const query = "DELETE FROM game_tags WHERE id_game = ?";

    db.query(query, [id_game], (err, result) => {
      if (err) {
        console.error("Ошибка при удаление тегов:", err);
        return res
          .status(500)
          .json({ error: "Ошибка сервера при удаление тегов" });
      }

      res.status(200).json({ message: "Данные об игре успешно обновлены" });
    });
  }),
  // Запрос на добавление новой связи тегов с игрой
  (exports.EditTagsAdd = async (req, res) => {
    const { id_game, id_tags } = req.body;

    const query = "INSERT INTO game_tags (id_game, id_tags) VALUES (?, ?)";

    try {
      // Вставляем каждый тег по очереди с ожиданием выполнения
      for (const tag of id_tags) {
        await new Promise((resolve, reject) => {
          db.query(query, [id_game, tag], (err, result) => {
            if (err) {
              console.error("Ошибка при добавлении тега:", err);
              return reject(err);
            }
            resolve(result);
          });
        });
      }
      res.status(200).json({ message: "Теги успешно добавлены" });
    } catch (err) {
      res.status(500).json({ error: "Ошибка при добавлении тегов" });
    }
  });
