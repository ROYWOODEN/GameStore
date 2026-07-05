<template>
  <section class="add-game-panel flex flex-row justify-center !mb-15">
    <div class="add-game-panel__background">
      <h1 class="add-game-panel__title text-center !mt-17 text-xl">
        Добавление игр:
      </h1>

      <main
        class="add-game-panel__content flex flex-row justify-center items-center !mt-16 text-white"
      >
        <form
          class="add-game-panel__form !ms-10 md:!ms-0"
          @submit.prevent="submitForm"
        >
          <div class="add-game-panel__form-group">
            <label for="game-title" class="add-game-panel__label text-lg"
              >Название игры:</label
            >
            <input
              id="game-title"
              v-model="gameTitle"
              type="text"
              required
              placeholder="Введите название игры"
              class="add-game-panel__input"
            />
          </div>
          <div class="add-game-panel__form-group">
            <label for="game-description" class="add-game-panel__label text-lg"
              >Описание игры:</label
            >
            <input
              id="game-description"
              v-model="gameDescription"
              type="text"
              required
              placeholder="Введите описание игры"
              class="add-game-panel__input"
            />
          </div>
          <div class="add-game-panel__form-group">
            <label for="game-img" class="add-game-panel__label text-lg"
              >Путь к фото:</label
            >
            <input
              id="game-img"
              accept="image/*"
              @change="handleFileUpload"
              type="file"
              ref="fileInput"
              required
              placeholder="Укажите путь к изображению"
              class="add-game-panel__input"
            />
          </div>
          <div class="add-game-panel__form-group">
            <label for="game-price" class="add-game-panel__label text-lg"
              >Цена:</label
            >
            <input
              id="game-price"
              v-model="gamePrice"
              min="1"
              type="number"
              placeholder="Укажите цену"
              class="add-game-panel__input"
              required
            />
          </div>

          <div class="flex flex-col">
            <label for="" class="add-game-panel__label text-lg"
              >Выберите тег #</label
            >
            <select v-model="gameTags[0]" class="add-game-panel__select">
              <option value="">-- # Тег 1 --</option>
              <option
                v-for="tag in gameStore.tagsSelect"
                :key="tag.id_tags"
                :value="tag.id_tags"
              >
                {{ tag.name }}
              </option>
            </select>

            <select v-model="gameTags[1]" class="add-game-panel__select">
              <option value="">-- # Тег 2 --</option>
              <option
                v-for="tag in gameStore.tagsSelect"
                :key="tag.id_tags"
                :value="tag.id_tags"
              >
                {{ tag.name }}
              </option>
            </select>

            <select v-model="gameTags[2]" class="add-game-panel__select">
              <option value="">-- # Тег 3 --</option>
              <option
                v-for="tag in gameStore.tagsSelect"
                :key="tag.id_tags"
                :value="tag.id_tags"
              >
                {{ tag.name }}
              </option>
            </select>

            <div class="add-game-panel__form-group">
              <label for="game-price" class="add-game-panel__label text-lg"
                >Создать новый тег</label
              >
              <div class="">
                <input
                  id="game-price"
                  v-model="NewTag"
                  type="text"
                  placeholder="Задайте новый тег"
                  class="add-game-panel__input-tag"
                />
                <button
                  @click="fetchAddTags"
                  type="button"
                  class="add-game-panel__button-tag"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
          <div
            class="add-game-panel__button-wrapper flex justify-center !mt-17 !mb-20"
          >
            <button
              type="submit"
              class="add-game-panel__button"
              @click="fetchAddGame"
            >
              Добавить игру
            </button>
          </div>
        </form>
      </main>
    </div>
  </section>
</template>

<script>
import { useGameStore } from "@/stores/GameStore";

export default {
  data() {
    return {
      gameTitle: "",
      gameDescription: "",
      gameImage: null,
      gamePrice: "",
      gameTags: ["", "", ""],
      NewTag: "",
      gameStore: useGameStore(),
    };
  },
  methods: {
    async fetchAddGame() {
      if (
        !this.gameTitle ||
        !this.gameDescription ||
        !this.gameImage ||
        !this.gamePrice ||
        !this.gameTags[0] ||
        !this.gameTags[1] ||
        !this.gameTags[2]
      ) {
        this.gameStore.showError("Пожалуйста, заполните все поля!");
        return;
      } else if (
        this.gameTags[0] === this.gameTags[1] ||
        this.gameTags[1] === this.gameTags[2] ||
        this.gameTags[0] === this.gameTags[2]
      ) {
        this.gameStore.showError(
          "Вы выбрали однинаковые теги для игры выберите разные пж",
        );
        return;
      }

      const formData = new FormData();

      formData.append("title", this.gameTitle);
      formData.append("description", this.gameDescription);
      formData.append("price", this.gamePrice);
      formData.append("image", this.gameImage);
      this.gameTags.forEach((tag) => {
        if (tag) formData.append("tags[]", tag);
      });

      // Отправка данных на сервер
      const response = await fetch(`${this.gameStore.apiURL}/addGame`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        this.gameStore.showMessage(result.message);
        this.gameTitle = "";
        this.gameDescription = "";
        this.$refs.fileInput.value = null;
        this.gameImage = null;
        this.gamePrice = "";
        this.gameTags = ["", "", ""];
      } else {
        console.error("Ошибка при добавлении игры");
        this.gameStore.showError(result.error);
      }
    },
    async fetchAddTags() {
      try {
        if (this.NewTag.trim(this.NewTag) === "") {
          this.gameStore.showError("Прошу введите название тега!");
          return;
        }
        const response = await fetch(`${this.gameStore.apiURL}/addTag`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            tag: this.NewTag,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(result.message);
          this.gameStore.showMessage(result.message);
          this.NewTag = "";
          this.gameStore.fetchTags();
        } else {
          console.error("Ошибка при добавлении игры");
          this.gameStore.showError("Кажется, что-то пошло не так :(");
        }
      } catch {
        this.gameStore.showError("Ошибка подключения к интернету");
      }
    },
    handleFileUpload(event) {
      this.gameImage = event.target.files[0];
      console.log(this.gameImage);
    },
  },
  async mounted() {
    this.gameStore.fetchTags();
  },
};
</script>

<style scoped lang="scss">
@use "../assets/scss/main.scss" as *;

.add-game-panel {
  &__background {
    background-color: $color-black-fon-panel;
    width: 70%;
    border-radius: 30px;
  }

  &__title {
    color: $color-grey-text-panel;
    font-family: Inter-SemiBold;
  }

  &__form-group {
    margin: 5% auto;
    display: flex;
    flex-direction: column;
  }

  &__input {
    background-color: $color-grey-input;
    font-family: Inter-Medium;
    padding: 5%;
    margin-top: 20px;
    border-radius: 40px;
    outline: none;
    width: 100%;
    min-width: 500px;
    transition:
      all 0.5s ease,
      border 0s ease;

    &:focus {
      border: 3px solid $color-purple;
      box-shadow: 0px 0px 16px 1px $color-purple;
    }
    &:hover {
      box-shadow: 0px 0px 16px 1px $color-purple;
    }
    &-tag {
      background-color: $color-grey-input;
      font-family: Inter-Medium;
      padding: 3%;
      margin-top: 20px;
      border-radius: 40px;
      outline: none;
      width: 50%;
      min-width: 350px;
      transition:
        all 0.5s ease,
        border 0s ease;

      &:focus {
        border: 3px solid $color-purple;
        box-shadow: 0px 0px 16px 1px $color-purple;
      }
      &:hover {
        box-shadow: 0px 0px 16px 1px $color-purple;
      }
    }
  }

  &__button {
    background-color: $color-purple;
    padding: 20px 40px;
    border-radius: 40px;
    font-family: Inter-Bold;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      background-color: $color-purple-hover;
    }
    &-tag {
      background-color: $color-purple;
      padding: 3% 40px;
      border-radius: 40px;
      font-family: Inter-Bold;
      cursor: pointer;
      transition: 0.3s;

      &:hover {
        background-color: $color-purple-hover;
      }
    }
  }

  &__select {
    background-color: $color-grey-input;
    font-family: Inter-Medium;
    padding: 4%;
    margin-top: 20px;
    border-radius: 40px;
  }
}

@media (width <=768px) {
  .add-game-panel {
    &__background {
      width: 90%;
    }

    &__form-group {
      margin: 5% auto;
      display: flex;
      flex-direction: column;
    }

    &__input {
      padding: 4%;
      width: 90%;
      min-width: 0;

      &-tag {
        padding: 3%;
        margin-top: 20px;
        border-radius: 40px;
        width: 50%;
        min-width: 0;
      }
    }

    &__button {
      background-color: $color-purple;
      padding: 20px 40px;
      border-radius: 40px;
      font-family: Inter-Bold;
      cursor: pointer;
      transition: 0.3s;

      &-tag {
        background-color: $color-purple;
        padding: 3% 40px;
        border-radius: 40px;
        font-family: Inter-Bold;
        cursor: pointer;
        transition: 0.3s;

        &:hover {
          background-color: $color-purple-hover;
        }
      }
    }

    &__select {
      padding: 4%;
      width: 90%;
    }
  }
}

@media (width <=390px) {
  .add-game-panel {
    &__background {
      width: 100%;
    }

    &__form-group {
      margin: 5% auto;
      display: flex;
      flex-direction: column;
    }

    &__input {
      padding: 4%;
      width: 96%;
      min-width: 0;

      &-tag {
        padding: 3%;
        margin-top: 20px;
        border-radius: 40px;
        width: 60%;
        min-width: 0;
      }
    }

    &__button {
      padding: 10px 30px;
      border-radius: 40px;
      cursor: pointer;
      transition: 0.3s;

      &-tag {
        background-color: $color-purple;
        padding: 3% 20px;
        border-radius: 40px;
        font-family: Inter-Bold;
        cursor: pointer;
        transition: 0.3s;
      }
    }
  }
}
</style>
