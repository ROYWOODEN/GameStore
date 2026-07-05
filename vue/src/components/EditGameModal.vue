<template>
  <section>
    <div class="dialog" @click="DelDialog">
      <div class="dialog__content" @click.stop="">
        <div class="dialog__header">
          <button class="dialog__close-btn" @click="DelDialog">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#8A8A8A"
              viewBox="0 0 16 16"
            >
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
              />
            </svg>
          </button>
          <h4 class="setting__title">Изменение игры:</h4>
        </div>

        <main v-if="gameStore.editGames && gameStore.editGames.length > 0">
          <div class="edit-container">
            <!-- Обертка для изображения -->
            <div class="image-wrapper">
              <img
                :src="gameStore.editGames[0].image_url"
                alt="Game Image"
                class="game-image"
              />
              <div class="image-overlay">
                <button class="change-image-btn" @click="triggerFileInput">
                  Изменить изображение
                </button>
              </div>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
              />
            </div>

            <textarea
              class="edit-textarea"
              v-model="description"
              placeholder="Описание игры"
            ></textarea>

            <input
              type="text"
              v-model="title"
              class="edit-title"
              placeholder="Название игры"
            />

            <input
              class="edit-price"
              min="1"
              type="number"
              v-model="price"
              placeholder="Цена"
            />

            <div class="tags-container">
              <div class="current-tags">
                <span
                  v-for="tag in gameStore.editGames[0].tags"
                  :key="tag.id_tags"
                  class="game-tag"
                  ># {{ tag.name }}</span
                >
              </div>

              <div class="tag-selectors">
                <select v-model="selectTag[0]" class="tag-select">
                  <option value="" selected disabled>Выберите тег 1</option>
                  <option
                    v-for="tag in gameStore.tagsSelect"
                    :key="tag.id_tags"
                    :value="tag.id_tags"
                  >
                    {{ tag.name }}
                  </option>
                </select>

                <select v-model="selectTag[1]" class="tag-select">
                  <option value="" selected disabled>Выберите тег 2</option>
                  <option
                    v-for="tag in gameStore.tagsSelect"
                    :key="tag.id_tags"
                    :value="tag.id_tags"
                  >
                    {{ tag.name }}
                  </option>
                </select>

                <select v-model="selectTag[2]" class="tag-select">
                  <option value="" selected disabled>Выберите тег 3</option>
                  <option
                    v-for="tag in gameStore.tagsSelect"
                    :key="tag.id_tags"
                    :value="tag.id_tags"
                  >
                    {{ tag.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="buttons-container">
              <button @click="DelDialog" class="cancel-btn">Отмена</button>
              <button
                @click="fetchGameUpdate(gameStore.editGames.id_game)"
                class="save-btn"
              >
                Сохранить
              </button>
            </div>
          </div>
        </main>

        <main v-else>
          <div class="loader"></div>
        </main>
      </div>
    </div>
  </section>
</template>

<script>
import { useGameStore } from "@/stores/GameStore";

export default {
  data() {
    return {
      gameStore: useGameStore(),
      game: [],
      title: "",
      description: "",
      price: "",
      OrigTitle: "",
      OrigDescription: "",
      OrigPrice: "",
      OrigTag: [],
      selectTag: ["", "", ""],
      newImage: null,
    };
  },
  methods: {
    toggleBodyScroll() {
      document.body.style.overflow = this.gameStore.EditGameModal
        ? ""
        : "hidden";
    },

    DelDialog() {
      console.log("Закрытие модального окна!");
      this.gameStore.EditGameModal = !this.gameStore.EditGameModal;
      this.toggleBodyScroll();
    },

    async fetchEdit() {
      if (this.gameStore.EditID) {
        await this.gameStore.fetchGameEdit(this.gameStore.EditID);

        // console.log(this.gameStore.editGames);
        const game = this.gameStore.editGames[0];

        this.OrigTitle = game.title;
        this.OrigDescription = game.description;
        this.OrigPrice = game.price;

        this.OrigTag = game.tags.map((tag) => tag.id_tags);

        console.log(this.OrigTag);
        this.selectTag = [this.OrigTag[0], this.OrigTag[1], this.OrigTag[2]];
        console.log(this.selectTag);

        if (this.gameStore.editGames) {
          this.title = game.title;
          this.description = game.description;
          this.price = game.price;
        }
      }
    },

    async fetchGameUpdate(id) {
      if (
        this.title === this.OrigTitle &&
        this.description === this.OrigDescription &&
        this.price === this.OrigPrice &&
        !this.newImage &&
        this.selectTag[0] === this.OrigTag[0] &&
        this.selectTag[1] === this.OrigTag[1] &&
        this.selectTag[2] === this.OrigTag[2]
      ) {
        console.log("Данные не изменены, запрос не отправляется!");
        this.gameStore.showError("Вы не внесли изменений!");
        return;
      } else if (
        this.selectTag[0] == this.selectTag[1] ||
        this.selectTag[0] == this.selectTag[2] ||
        this.selectTag[1] == this.selectTag[2]
      ) {
        console.log("Теги одинаковые, запрос не отправляется!");
        this.gameStore.showError("Вы выбрали одинаковые теги, выберите разные");
        return;
      } else if (
        this.title == "" ||
        this.description == "" ||
        this.price == ""
      ) {
        console.log("Данные не изменены, запрос не отправляется!");
        this.gameStore.showError("У вас есть не заполненные поля!");
        return;
      }

      const formData = new FormData();

      formData.append("title", this.title);
      formData.append("description", this.description);
      formData.append("price", this.price);
      if (this.newImage) {
        formData.append("image", this.newImage);
      }

      const response = await fetch(
        `${this.gameStore.apiURL}/admin/edit/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        this.gameStore.showMessage(result.message);
        this.DelDialog();
        this.gameStore.fetchGames();
      } else {
        this.gameStore.showError("Кажется - что-то пошло не так :(");
      }

      if (
        this.selectTag[0] === this.OrigTag[0] &&
        this.selectTag[1] === this.OrigTag[1] &&
        this.selectTag[2] === this.OrigTag[2]
      ) {
        return;
      }
      this.fetchTagsEdit(id);
    },

    async fetchTagsEdit(id_game) {
      try {
        console.log("Удаляем старые теги для игры с id:", id_game);
        const deleteResponse = await fetch(
          `${this.gameStore.apiURL}/admin/edit/tags/${id_game}`,
          {
            method: "DELETE",
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Ошибка при удалении тегов");
        }

        console.log("Добавляем новые теги для игры с id:", id_game);
        const addResponse = await fetch(
          `${this.gameStore.apiURL}/admin/edit/tags`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
              id_game: id_game,
              id_tags: this.selectTag,
            }),
          }
        );

        if (!addResponse.ok) {
          throw new Error("Ошибка при добавлении тегов");
        }

        console.log("Теги успешно обновлены");
        this.gameStore.fetchGames();
      } catch (error) {
        this.gameStore.showError("Ошибка при обновлении тегов");
        console.error("Ошибка при обновлении тегов:", error);
      }
    },

    handleImageChange(event) {
      this.newImage = event.target.files[0];

      if (this.newImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.querySelector(".image-wrapper img").src = e.target.result;
        };
        reader.readAsDataURL(this.newImage);
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },
  },

  created() {
    this.fetchEdit();
    this.toggleBodyScroll();
    this.gameStore.fetchTags();
  },
};
</script>

<style scoped lang="scss">
@use "../assets/scss/main.scss" as *;

.dialog {
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  &__content {
    position: relative;
    margin: auto;
    max-height: 90vh;
    overflow-y: auto;
    background-color: #242424;
    border-radius: 12px;
    padding: 24px;
    width: 100%;
    max-width: 500px;
  }

  &__header {
    position: relative;
    margin-bottom: 20px;
    padding-right: 30px;
  }

  &__close-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }
}

.setting__title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.edit-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-wrapper {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16/9;

  &:hover .image-overlay {
    opacity: 1;
  }
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.change-image-btn {
  background-color: $color-purple;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: 0.3s;

  &:hover {
    background-color: $color-purple-hover;
  }
}

.edit-textarea,
.edit-title,
.edit-price,
.tag-select {
  width: 100%;
  background-color: $color-grey-input;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

.edit-textarea {
  min-height: 120px;
  resize: vertical;
}

.edit-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.edit-price {
  font-size: 1rem;
}

.tags-container {
  margin-top: 8px;
}

.current-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.game-tag {
  background-color: rgba($color-purple, 0.2);
  color: $color-purple;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-selectors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

.buttons-container {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: none;
  border: 2px solid $color-grey-card-text;
  color: $color-grey-text;

  &:hover {
    border-color: white;
    color: white;
  }
}

.save-btn {
  background-color: $color-purple;
  color: white;
  border: none;

  &:hover {
    background-color: $color-purple-hover;
  }
}

.hidden {
  display: none;
}

/* Адаптация для планшетов и десктопов */
@media (min-width: 768px) {
  .dialog__content {
    padding: 40px;
  }

  .edit-container {
    gap: 20px;
  }

  .tag-selectors {
    flex-direction: row;

    select {
      flex: 1;
    }
  }

  .buttons-container {
    justify-content: flex-end;

    button {
      flex: 0 1 160px;
    }
  }
}
</style>
