import { ref, watch } from "vue";

type Theme = "light" | "dark";

const theme = ref<Theme>((localStorage.getItem("theme") as Theme) || "light");

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle("dark", value === "dark");
}

applyTheme(theme.value);

watch(theme, (value) => {
  localStorage.setItem("theme", value);
  applyTheme(value);
});

export function useTheme() {
  function toggle() {
    theme.value = theme.value === "light" ? "dark" : "light";
  }

  return { theme, toggle };
}
