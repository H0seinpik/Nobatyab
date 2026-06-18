import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import "./style.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

if (localStorage.getItem("accessToken")) {
  void useAuthStore(pinia).fetchMe().then((result) => {
    if (result === "changed") {
      void useAuthStore(pinia).logout().then(() => {
        router.push({ name: "login", query: { reason: "session-changed" } });
      });
    }
  });
}

app.mount("#app");
