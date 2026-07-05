import { defineStore } from "pinia";
import { useRouter } from "vue-router";

export const useGameStore = defineStore("GameStore", {
  state: () => ({
    router: useRouter(),
    apiURL: import.meta.env.VITE_API_URL,
    games: [],
    user: null,
    token: localStorage.getItem("token") || null,
    EditID: [],
    editGames: {},
    editGamesTags: [],
    tagsSelect: [],

    loginDialog: false,
    settingDialog: false,
    EditGameModal: true,
    loader: false,

    message: "",
    messageError: "",
  }),
  actions: {
    async fetchGames() {
      // if (this.loader) return;

      this.loader = true; // Показываем лоадер сразу, до задержки

      try {
        const response = await fetch(`${this.apiURL}/games`);

        if (response.ok) {
          this.games = await response.json();
        } else {
          this.showError("Не удалось подключиться к серверу");
        }
      } catch (error) {
        console.error("Ошибка при получении игр:", error);
        this.showError("Нет доступа к интернету");
      } finally {
        this.loader = false; // Скрываем лоадер после загрузки
      }
    },

    async DelGames(id) {
      try {
        const response = await fetch(`${this.apiURL}/admin/del/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const result = await response.json();
          this.showError(result.message);

          this.games = this.games.filter((game) => game.id_game !== id);
        } else {
          const result = await response.json();
          this.showError(result.error);
        }
      } catch (error) {
        console.log("Ошибка при удалении игры:", error.message);
        this.showError("Не удалось подключиться к серверу");
      }
    },
    async fetchTags() {
      try {
        const response = await fetch(`${this.apiURL}/tags`);
        this.tagsSelect = await response.json();
      } catch {
        console.error("Ошибка получения тегов");
      }
    },
    async fetchGameEdit(id) {
      try {
        const response = await fetch(`${this.apiURL}/admin/edit/${id}`);
        if (!response.ok) throw new Error("Ошибка загрузки данных");

        this.editGames = await response.json();
      } catch (error) {
        console.error("Ошибка при загрузке данных игры:", error.message);
      }
    },

    async fetchUser() {
      if (!this.token) {
        return;
      }
      // console.log(this.token);

      try {
        const response = await fetch(`${this.apiURL}/user`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (response.ok) {
          this.user = await response.json();
        } else {
          this.logout();
        }
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      }
    },

    logout() {
      // const router = useRouter();

      localStorage.removeItem("token");
      this.user = null;
      this.token = null;
      this.fetchGames();
      this.router.push("/");
    },

    showMessage(mess) {
      this.message = mess; // Устанавливаем сообщение об ошибке
      setTimeout(() => {
        this.message = ""; // Очищаем сообщение через 3 секунды
      }, 3000);
    },
    showError(mess) {
      this.messageError = mess; // Устанавливаем сообщение об ошибке
      setTimeout(() => {
        this.messageError = ""; // Очищаем сообщение через 3 секунды
      }, 3000);
    },
  },
});
