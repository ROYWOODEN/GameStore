<template>
  <div
    class="flex flex-col justify-center items-center !px-1 !py-1 md:!px-3 md:!py-3"
  >
    <div v-if="!isLoadet">
      <div class="loader"></div>
    </div>
    <div
      :class="{ 'is-loaded': isLoadet }"
      class="game_card w-full md:max-w-90 xl:max-w-150 hover:-translate-y-2 rounded-xl overflow-hidden game-card flex flex-col justify-between"
    >
      <img
        class="w-full"
        @load="onImageLoad"
        :src="game.image_url"
        alt="Упс.. Кажется что-то пошло не так :("
      />
      <div class="!px-6 !py-4">
        <div class="text-lg lg:text-xl mb-2 game-card__title">
          {{ game.title }}
        </div>

        <p
          class="game-card__info text-base"
          :class="{ 'game-card__info-active': expanded }"
        >
          {{ game.description }}
        </p>
        <button
          type="button"
          @click="toggleExpand"
          class="game-card__button-active"
        >
          {{ expanded ? "Скрыть" : "Показать ещё" }}
        </button>
      </div>
      <div class="!mb-10 !px-6 !pt-2 !pb-10 flex flex-wrap h-16">
        <span
          v-for="(tag, idx) in game.tags"
          :key="idx"
          class="inline-block game-card__tag rounded-lg !px-3 !py-1 text-sm font-semibold !mr-2 !mt-2"
          ># {{ tag.name }}</span
        >
      </div>
      <div
        class="flex justify-between items-center !px-10 !py-5 !mt-4 md:!mt-1"
      >
        <div class="game-card__price text-lg lg:text-2xl font-medium">
          ${{ game.price }}
        </div>
        <div class="flex flex-row items-center">
          <div
            @click="DelFavouritesGames(game.id_game)"
            class="svg__padding !me-3"
          >
            <svg
              v-if="isFavorLocal"
              class="svg__fon"
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="currentColor"
              class="bi bi-bookmark svg__fon"
              viewBox="0 0 16 16"
            >
              <path
                d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"
              />
            </svg>
          </div>

          <button
            @click="toggleBasket"
            type="button"
            class="game-card__button text-sm md:text-base"
            :class="{ ActiveBtn: isBasketLocal }"
          >
            {{ isBasketLocal ? "В корзине" : "В корзину" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from "@/stores/GameStore";
import { useUserStore } from "@/stores/UserStore";
import { useRoute } from "vue-router";

export default {
  props: {
    game: {
      type: Object,
      required: true,
    },
    isFavor: {
      type: Boolean,
      required: true,
    },
    isBasket: {
      type: Boolean,
      default: false,
      // required: true,
    },
  },

  data() {
    return {
      gameStore: useGameStore(),
      userStore: useUserStore(),
      route: useRoute(),
      expanded: false,
      isFavorLocal: false,
      isBasketLocal: false,
      isLoadet: false,
    };
  },
  async mounted() {
    if (!this.gameStore.token) {
      return;
    }

    await Promise.all([
      this.isFavor ? (this.isFavorLocal = true) : this.fetchFavoritCheck(),
      this.isBasket ? (this.isBasketLocal = true) : this.fetchBasketCheck(),
    ]);
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },

    onImageLoad() {
      setTimeout(() => {
        this.isLoadet = true;
      }, 900);
    },

    async DelFavouritesGames(id) {
      if (!this.gameStore.token) {
        this.gameStore.showError("Пожалуйста авторизуйтесь");
        this.gameStore.loginDialog = !this.gameStore.loginDialog;
        return;
      }

      if (this.isFavorLocal == true) {
        const res = await fetch(
          `${this.gameStore.apiURL}/favourites/del/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${this.gameStore.token}`,
            },
          }
        );
        const data = await res.json();

        if (res.ok) {
          this.gameStore.showError(data.message);
          this.isFavorLocal = !this.isFavorLocal;
          this.userStore.fetchFavorite();
          return;
        } else {
          this.gameStore.showError(data.error);
        }
      }

      const respounse = await fetch(`${this.gameStore.apiURL}/favourites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Bearer ${this.gameStore.token}`,
        },
        body: JSON.stringify({
          id: id,
        }),
      });
      const result = await respounse.json();

      if (respounse.ok) {
        this.gameStore.showMessage(result.message);
        this.isFavorLocal = !this.isFavorLocal;
      } else {
        this.gameStore.showError(result.error);
      }
    },
    async fetchFavoritCheck() {
      if (!this.gameStore.token) {
        return;
      }

      const respounse = await fetch(
        `${this.gameStore.apiURL}/favourites/check/${this.game.id_game}`,
        {
          headers: {
            Authorization: `Bearer ${this.gameStore.token}`,
          },
        }
      );

      const data = await respounse.json();
      if (respounse.ok) {
        this.isFavorLocal = data.isFavor;
      }
    },
    async fetchBasketCheck() {
      try {
        const response = await fetch(
          `${this.gameStore.apiURL}/basket/check/${this.game.id_game}`,
          {
            headers: {
              Authorization: `Bearer ${this.gameStore.token}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          this.isBasketLocal = data.isBasket;
        } else {
          console.error("Ошибка от сервера:", data);
          this.gameStore.showError(data.error);
        }
      } catch (err) {
        console.error("Ошибка сети или запроса:", err);
        this.gameStore.showError(data.error);
      }
    },

    async toggleBasket() {
      if (!this.gameStore.token) {
        this.gameStore.showError("Пожалуйста авторизуйтесь");
        this.gameStore.loginDialog = true;
        return;
      }

      if (this.isBasketLocal) {
        await this.userStore.fetchDelBasket(this.game.id_game);
        this.userStore.fetchBasket();
        this.isBasketLocal = false;
      } else {
        await this.userStore.fetchAddBasket(this.game.id_game);
        this.isBasketLocal = true;
      }
    },
  },

  watch: {
    "gameStore.token": {
      immediate: true,
      handler() {
        if (this.route.name !== "favourites") {
          this.fetchFavoritCheck();
        }
      },
    },
  },
};
</script>

<style lang="scss">
@use "../assets/scss/main.scss" as *;

.game-card {
  background-color: $color-grey-card-fon;
  box-shadow: 4px 4px 6px 0px rgba(0, 0, 0, 25%);
  transition: 0.5s;

  &:hover {
    box-shadow: 4px 4px 6px 0px rgba(218, 0, 254, 50%);
  }
  &__title {
    font-family: Inter-Medium;
  }
  &__info {
    color: $color-grey-card-text;
    font-family: Inter-Regular;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__info-active {
    white-space: pre-wrap;
  }
  &__tag {
    border: 2px solid $color-purple;
    font-family: Inter-MediumItalic;
  }
  &__price {
    color: $color-purple;
  }
  &__button {
    background-color: $color-purple;
    padding: 10px 12px 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.5s;

    &:hover {
      background-color: $color-purple-hover;
    }
    &-active {
      cursor: pointer;
      transition: 0.5s;

      &:hover {
        color: $color-purple;
      }
    }
  }

  & .ActiveBtn {
    background-color: $color-red-exit;

    &:hover {
      background-color: $color-red-btn-hover;
    }
  }
}

.svg__fon {
  fill: $color-purple-favirute-icon;
}
.svg__padding {
  background-color: $color-purple-favorite-fon;
  padding: 10px 10px 10px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.game_card {
  opacity: 0;
  // transition: opacity 0.3s;

  &.is-loaded {
    opacity: 1;
  }
}

@media (width <= 768px) {
  .game-card {
    background-color: $color-grey-card-fon;
    box-shadow: 4px 4px 6px 0px rgba(0, 0, 0, 25%);
    transition: 0.5s;

    &__price {
      color: $color-purple;
    }
    &__button {
      background-color: $color-purple;
      // padding: 10px 12px 10px 12px;
      padding: 8px 10px 8px 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: 0.5s;
    }
  }

  .svg__fon {
    fill: $color-purple-favirute-icon;
  }
  .svg__padding {
    background-color: $color-purple-favorite-fon;
    padding: 7px 7px 7px 7px;
    border-radius: 10px;
    cursor: pointer;
  }
}
</style>
